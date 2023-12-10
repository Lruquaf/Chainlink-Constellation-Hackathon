// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {VRFCoordinatorV2Interface} from "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import {VRFConsumerBaseV2} from "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {IWETH} from "./IWETH.sol";
import {IUniswapV2Router} from "./IUniswapV2Router.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";

error TransferFailed();
error InsufficientEth();
error NotBeneficiaryAddress();
error NotMinterContract();
error TokenDoesNotExist();
error CallerIsNotTokenOwner();

contract MagisterMilitum is
    Ownable,
    ERC721,
    VRFConsumerBaseV2,
    AutomationCompatibleInterface,
    FunctionsClient
{
    using FunctionsRequest for FunctionsRequest.Request;
    event NftMinted(
        address indexed owner,
        uint256 indexed tokenId,
        uint256 indexed generalId
    );

    event MintRequested(uint256 requestId, address indexed requester);

    uint256 private tokenCounter;

    mapping(uint256 tokenId => string tokenUri) private tokenUris;
    string[] public generalUris;

    address private beneficiary1;
    address private beneficiary2;
    mapping(address beneficiary => uint256 amount) private proceeds;

    uint256 public immutable tokenPrice; // in USD
    uint256 public immutable updatePrice; // in USD
    AggregatorV3Interface public immutable priceFeed;

    VRFCoordinatorV2Interface public vrfCoordinator;
    uint64 public vrfSubscriptionId;
    bytes32 public keyHash;
    uint16 public requestConfirmations;
    uint32 public callbackGasLimit;
    uint32 public numWords = 1;
    mapping(uint256 vrfRequestId => address vrfRequester) public vrfRrequests;

    LinkTokenInterface public linkToken;

    IWETH public weth;
    IUniswapV2Router public uniswapRouter;

    address public automationRegistry;
    uint256 public automationSubscriptionId;

    address public functionsRouter;
    string public source =
        "const [originalUri, newUri] = args;"
        "let isValid = 0;"
        "const makeHttpRequest = async (uri) => {"
        "const response = await Functions.makeHttpRequest({ url: uri });"
        "if (response.error) {"
        "console.error(response.error);"
        "throw Error(`${uri} Api Request failed`);"
        "}"
        "return response.data;"
        "};"
        "const originalData = await makeHttpRequest(originalUri);"
        "const newData = await makeHttpRequest(newUri);"
        "console.log('Original API response data:', JSON.stringify(originalData, null, 2));"
        "console.log('New API response data:', JSON.stringify(newData, null, 2));"
        "const checkAttributes = (attr1, attr2) => attr1.length === attr2.length && attr1.every((a, i) => a.trait_type === attr2[i].trait_type && (a.value <= 100 && a.value >= 0));"
        "if ("
        "Object.keys(originalData).length === Object.keys(newData).length &&"
        "originalData.name === newData.name &&"
        "originalData.title === newData.title &&"
        "originalData.description === newData.description &&"
        "originalData.image === newData.image &&"
        "checkAttributes(originalData.attributes, newData.attributes)"
        ") {"
        "isValid = 1;"
        "}"
        "const returnedValue = isValid ? newUri : 'invalid input';"
        "return Functions.encodeString(returnedValue);";
    uint64 public functionsSubscriptionId;
    uint32 public gasLimit;
    bytes32 public donID;
    mapping(uint256 functionsRequestId => uint256 requesterTokenId)
        public functionsRequests;

    bytes public lastResponse;
    bytes public lastError;

    constructor(
        string[] memory _generalUris,
        address _beneficiary1,
        address _beneficiary2,
        uint256 _tokenPrice,
        uint256 _updatePrice,
        address _priceFeed,
        address _vrfCoordinator,
        uint64 _vrfSubscriptionId,
        bytes32 _keyHash,
        uint16 _requestConfirmations,
        uint32 _callbackGasLimit,
        address _linkToken,
        address _weth,
        address _uniswapRouter,
        address _automationRegistry,
        address _functionsRouter,
        uint64 _functionsSubscriptionId,
        uint32 _gasLimit,
        bytes32 _donID
    )
        ERC721("Magister Militum", "MM")
        Ownable(msg.sender)
        VRFConsumerBaseV2(_vrfCoordinator)
        FunctionsClient(_functionsRouter)
    {
        tokenCounter = 0;
        generalUris = _generalUris;
        beneficiary1 = _beneficiary1;
        beneficiary2 = _beneficiary2;

        tokenPrice = _tokenPrice;
        updatePrice = _updatePrice;
        priceFeed = AggregatorV3Interface(_priceFeed);

        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        vrfSubscriptionId = _vrfSubscriptionId;
        keyHash = _keyHash;
        callbackGasLimit = _callbackGasLimit;
        requestConfirmations = _requestConfirmations;

        linkToken = LinkTokenInterface(_linkToken);

        uniswapRouter = IUniswapV2Router(_uniswapRouter);
        weth = IWETH(_weth);
        weth.approve(address(uniswapRouter), type(uint256).max);

        automationRegistry = _automationRegistry;

        functionsRouter = _functionsRouter;
        functionsSubscriptionId = _functionsSubscriptionId;
        gasLimit = _gasLimit;
        donID = _donID;
    }

    function setAutomation(uint256 _automationSubscriptionId) public onlyOwner {
        automationSubscriptionId = _automationSubscriptionId;
    }

    modifier onlyBeneficiaries() {
        if (msg.sender != beneficiary1 && msg.sender != beneficiary2) {
            revert NotBeneficiaryAddress();
        }
        _;
    }

    ////////////////////////////////////////////////////////
    ////////////////// PRICE FEED SECTION //////////////////
    ////////////////////////////////////////////////////////

    function getPrice(uint256 _amountInGas) public view returns (uint256) {
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        uint256 _amountInUsd = (uint256(answer) * 1e10 * _amountInGas) / 1e18;
        return _amountInUsd;
    }

    function getTokenPriceInEth() public view returns (uint256) {
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        return
            uint256((tokenPrice * 1e18) / (uint256(answer) * 1e10)) +
            0.0001 ether; // without this addition value, the amount may be below of token price in USD
    }

    function getUpdatePriceInEth() public view returns (uint256) {
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        return
            uint256((updatePrice * 1e18) / (uint256(answer) * 1e10)) +
            0.0001 ether; // without this addition value, the amount may be below of token price in USD
    }

    ////////////////////////////////////////////////////////
    ////////////////// VRF SECTION /////////////////////////
    ////////////////////////////////////////////////////////

    function mintNft() public payable {
        if (getPrice(msg.value) < tokenPrice) {
            revert InsufficientEth();
        }

        uint256 _requestId = vrfCoordinator.requestRandomWords(
            keyHash,
            vrfSubscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        vrfRrequests[_requestId] = msg.sender;
        weth.deposit{value: msg.value}();
        emit MintRequested(_requestId, msg.sender);
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        uint256 _randomIndex = _randomWords[0] % generalUris.length;
        address _to = vrfRrequests[_requestId];
        _mint(_to, tokenCounter);
        tokenUris[tokenCounter] = generalUris[_randomIndex];
        emit NftMinted(_to, tokenCounter, _randomIndex);
        tokenCounter++;
    }

    function topUpVRFSubscription(uint256 _amount) public {
        linkToken.transferAndCall(
            address(vrfCoordinator),
            _amount,
            abi.encode(vrfSubscriptionId)
        );
    }

    ////////////////////////////////////////////////////////
    ////////////////// AUTOMATION SECTION //////////////////
    ////////////////////////////////////////////////////////

    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        upkeepNeeded = (weth.balanceOf(address(this)) >= 0.02 ether);
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        if (weth.balanceOf(address(this)) >= 0.02 ether) {
            swapTokens();
            distributeTokens();
        }
    }

    function topUpAutomationSubscription(
        uint256 _amount
    ) public /*only zartzurt*/ {
        linkToken.transferAndCall(
            automationRegistry,
            _amount,
            abi.encode(automationSubscriptionId)
        );
    }

    ////////////////////////////////////////////////////////
    ////////////// FUNCTIONS SECTION ///////////////////////
    ////////////////////////////////////////////////////////

    function updateUri(uint256 _tokenId, string memory _newUri) public payable {
        if (getPrice(msg.value) < updatePrice) {
            revert InsufficientEth();
        }
        if (ownerOf(_tokenId) != msg.sender) {
            revert CallerIsNotTokenOwner();
        }
        string memory _originalUri = tokenUris[_tokenId];
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        string[] memory args = new string[](2);
        args[0] = _originalUri;
        args[1] = _newUri;
        if (args.length > 0) req.setArgs(args);
        uint256 _requestId = uint256(
            _sendRequest(
                req.encodeCBOR(),
                functionsSubscriptionId,
                gasLimit,
                donID
            )
        );
        functionsRequests[_requestId] = _tokenId;
        weth.deposit{value: msg.value}();
    }

    function fulfillRequest(
        bytes32 _requestId,
        bytes memory _response,
        bytes memory _err
    ) internal override {
        lastResponse = _response;
        lastError = _err;
        string memory newUri = string(_response);
        if (_response.length != 0) {
            if (keccak256(bytes(newUri)) != keccak256(bytes("invalid input"))) {
                tokenUris[functionsRequests[uint256(_requestId)]] = newUri;
            }
        }
        // if error is not empty ...
    }

    function topUpFunctionsSubscription(uint256 _amount) public {
        linkToken.transferAndCall(
            functionsRouter,
            _amount,
            abi.encode(functionsSubscriptionId)
        );
    }

    ////////////////////////////////////////////////////////
    ////////////// SWAP AND DISTRIBUTE SECTION /////////////
    ////////////////////////////////////////////////////////

    function swapTokens() public {
        address _tokenIn = address(weth);
        address _tokenOut = address(linkToken);
        uint256 _amountIn = weth.balanceOf(address(this));
        uint256 _amountOutMin = getAmountOutMin(_tokenIn, _tokenOut, _amountIn);

        address[] memory path;
        if (_tokenIn == address(weth) || _tokenOut == address(weth)) {
            path = new address[](2);
            path[0] = _tokenIn;
            path[1] = _tokenOut;
        } else {
            path = new address[](3);
            path[0] = _tokenIn;
            path[1] = address(weth);
            path[2] = _tokenOut;
        }

        uniswapRouter.swapExactTokensForTokens(
            _amountIn,
            _amountOutMin,
            path,
            address(this),
            block.timestamp
        );
    }

    function getAmountOutMin(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn
    ) public view returns (uint256) {
        address[] memory path;

        if (_tokenIn == address(weth) || _tokenOut == address(weth)) {
            path = new address[](2);
            path[0] = _tokenIn;
            path[1] = _tokenOut;
        } else {
            path = new address[](3);
            path[0] = _tokenIn;
            path[1] = address(weth);
            path[2] = _tokenOut;
        }

        uint256[] memory amountOutMins = IUniswapV2Router(uniswapRouter)
            .getAmountsOut(_amountIn, path);
        return amountOutMins[path.length - 1];
    }

    function distributeTokens() public {
        uint256 _balance = linkToken.balanceOf(address(this));
        topUpVRFSubscription(_balance / 5);
        topUpAutomationSubscription(_balance / 5);
        topUpFunctionsSubscription(_balance / 5);
        proceeds[beneficiary1] += _balance / 5;
        proceeds[beneficiary2] += _balance / 5;
    }

    //////////////////////////////////////////////////

    function withdrawFunds() public onlyBeneficiaries {
        uint256 _amount = proceeds[msg.sender];
        proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: _amount}("");
        if (!success) {
            revert TransferFailed();
        }
    }

    function addTokenUri(string[] memory _tokenUris) public onlyOwner {
        for (uint256 i = 0; i < _tokenUris.length; ) {
            generalUris.push(_tokenUris[i]);
            unchecked {
                i++;
            }
        }
    }

    function changeBeneficiary(
        address _newBeneficiary
    ) public onlyBeneficiaries {
        if (msg.sender == beneficiary1) {
            uint256 _amount = proceeds[msg.sender];
            proceeds[msg.sender] = 0;
            proceeds[_newBeneficiary] += _amount;
            beneficiary1 = _newBeneficiary;
        } else {
            uint256 _amount = proceeds[msg.sender];
            proceeds[msg.sender] = 0;
            proceeds[_newBeneficiary] += _amount;
            beneficiary2 = _newBeneficiary;
        }
    }

    function tokenURI(
        uint256 _tokenId
    ) public view override returns (string memory) {
        if (_tokenId >= tokenCounter) {
            revert TokenDoesNotExist();
        }
        return tokenUris[_tokenId];
    }

    function getTokenCounter() public view returns (uint256) {
        return tokenCounter;
    }

    function getGeneralUris() public view returns (string[] memory) {
        string[] memory _generalUris = new string[](generalUris.length);
        for (uint256 i = 0; i < generalUris.length; i++) {
            _generalUris[i] = generalUris[i];
        }
        return _generalUris;
    }

    function getProceeds(address _beneficiary) public view returns (uint256) {
        return proceeds[_beneficiary];
    }
}
