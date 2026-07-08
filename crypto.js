(() => {
  "use strict";

  const CRYPTO_WALLETS = {
    eth: {
      // Replace with the live Ethereum donation address before accepting donations.
      address: "REPLACE_WITH_ETH_ADDRESS",
      chainId: "0x1"
    },
    btc: {
      // Replace with the live Bitcoin donation address before accepting donations.
      address: "REPLACE_WITH_BTC_ADDRESS"
    }
  };

  const ethAddress = document.querySelector("#eth-address");
  const btcAddress = document.querySelector("#btc-address");
  const ethAmount = document.querySelector("#eth-amount");
  const btcAmount = document.querySelector("#btc-amount");
  const ethStatus = document.querySelector("#eth-status");
  const btcStatus = document.querySelector("#btc-status");
  const ethConnect = document.querySelector("#eth-connect");
  const ethSend = document.querySelector("#eth-send");
  const ethCopy = document.querySelector("#eth-copy");
  const btcCopy = document.querySelector("#btc-copy");
  const btcUri = document.querySelector("#btc-uri");

  if (!ethAddress || !btcAddress) {
    return;
  }

  let connectedEthAccount = "";

  init();

  function init() {
    renderAddress("eth", ethAddress, ethStatus);
    renderAddress("btc", btcAddress, btcStatus);

    ethConnect.addEventListener("click", connectEthereumWallet);
    ethSend.addEventListener("click", prepareEthereumDonation);
    ethCopy.addEventListener("click", () => copyAddress("eth", ethStatus));
    btcCopy.addEventListener("click", () => copyAddress("btc", btcStatus));
    btcUri.addEventListener("click", openBitcoinUri);
  }

  function renderAddress(asset, target, status) {
    const wallet = CRYPTO_WALLETS[asset];
    if (!isConfigured(asset)) {
      target.textContent = `${asset.toUpperCase()} wallet address not configured`;
      target.classList.add("is-missing");
      setStatus(status, `Set ${asset.toUpperCase()} address in crypto.js before going live.`, true);
      return;
    }

    target.textContent = wallet.address;
    target.classList.remove("is-missing");
    setStatus(status, "Ready for verified donations.", false);
  }

  async function connectEthereumWallet() {
    if (!isConfigured("eth")) {
      setStatus(ethStatus, "Add the real ETH recipient address in crypto.js first.", true);
      return;
    }
    if (!window.ethereum) {
      setStatus(ethStatus, "No Ethereum wallet detected. Install MetaMask or copy the address manually.", true);
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      connectedEthAccount = accounts[0] || "";
      if (!connectedEthAccount) {
        setStatus(ethStatus, "Wallet connected, but no account was returned.", true);
        return;
      }
      setStatus(ethStatus, `Connected: ${shortAddress(connectedEthAccount)}`, false);
    } catch (error) {
      setStatus(ethStatus, "Wallet connection was cancelled or failed.", true);
    }
  }

  async function prepareEthereumDonation() {
    if (!isConfigured("eth")) {
      setStatus(ethStatus, "Add the real ETH recipient address in crypto.js first.", true);
      return;
    }
    if (!window.ethereum) {
      setStatus(ethStatus, "No Ethereum wallet detected. Copy the address and send from your wallet.", true);
      return;
    }

    try {
      if (!connectedEthAccount) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        connectedEthAccount = accounts[0] || "";
      }

      await ensureEthereumMainnet();

      const amount = Number.parseFloat(ethAmount.value);
      if (!Number.isFinite(amount) || amount <= 0) {
        setStatus(ethStatus, "Enter an ETH amount greater than zero.", true);
        return;
      }

      const value = ethToWeiHex(amount);
      await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [{
          from: connectedEthAccount,
          to: CRYPTO_WALLETS.eth.address,
          value
        }]
      });
      setStatus(ethStatus, "Transaction submitted. Confirm final status in your wallet.", false);
    } catch (error) {
      setStatus(ethStatus, transactionErrorMessage(error), true);
    }
  }

  async function ensureEthereumMainnet() {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (chainId === CRYPTO_WALLETS.eth.chainId) {
      return;
    }

    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CRYPTO_WALLETS.eth.chainId }]
    });
  }

  async function copyAddress(asset, status) {
    if (!isConfigured(asset)) {
      setStatus(status, `Add the real ${asset.toUpperCase()} address in crypto.js first.`, true);
      return;
    }

    try {
      await navigator.clipboard.writeText(CRYPTO_WALLETS[asset].address);
      setStatus(status, `${asset.toUpperCase()} address copied. Verify it before sending.`, false);
    } catch (error) {
      setStatus(status, "Clipboard copy failed. Select and copy the address manually.", true);
    }
  }

  function openBitcoinUri() {
    if (!isConfigured("btc")) {
      setStatus(btcStatus, "Add the real BTC recipient address in crypto.js first.", true);
      return;
    }

    const amount = Number.parseFloat(btcAmount.value);
    const amountParam = Number.isFinite(amount) && amount > 0
      ? `?amount=${encodeURIComponent(amount.toFixed(8))}`
      : "";
    window.location.href = `bitcoin:${CRYPTO_WALLETS.btc.address}${amountParam}`;
    setStatus(btcStatus, "Bitcoin wallet link opened if your browser supports it.", false);
  }

  function isConfigured(asset) {
    const address = CRYPTO_WALLETS[asset].address;
    return Boolean(address)
      && !address.startsWith("REPLACE_WITH_")
      && address.length > 20;
  }

  function setStatus(target, message, warning) {
    target.textContent = message;
    target.classList.toggle("is-warning", warning);
  }

  function shortAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  function ethToWeiHex(amount) {
    const fixed = amount.toFixed(18);
    const [whole, fraction = ""] = fixed.split(".");
    const paddedFraction = fraction.padEnd(18, "0").slice(0, 18);
    const wei = BigInt(whole) * 10n ** 18n + BigInt(paddedFraction);
    return `0x${wei.toString(16)}`;
  }

  function transactionErrorMessage(error) {
    if (error && error.code === 4001) {
      return "Transaction was rejected in the wallet.";
    }
    if (error && error.message) {
      return error.message;
    }
    return "Transaction could not be prepared.";
  }
})();
