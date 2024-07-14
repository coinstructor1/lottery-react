import Web3 from 'web3';

const connectWallet = async () => {
  if (window.ethereum) {
    // Erstelle eine Instanz von Web3 mit dem aktuellen Provider
    const web3 = new Web3(window.ethereum);

    try {
      // Fordere die Benutzer auf, sich mit MetaMask zu verbinden
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      return web3;
    } catch (error) {
      console.error("User rejected the request.");
      return null;
    }
  } else {
    console.error("MetaMask is not installed.");
    return null;
  }
};

export default connectWallet;
