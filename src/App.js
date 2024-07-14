import React, { useState, useEffect } from "react";
import web3 from "./web3";
import lottery from "./lottery";

function App() {
  const [account, setAccount] = useState("not connected");
  const [manager, setManager] = useState("");
  const [players, setPlayers] = useState([]);
  const [balance, setBalance] = useState("");
  const [message, setMessage] = useState("");
  const [valueToEnter, setValueToEnter] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const loadStates = async () => {
      setManager(await lottery.methods.manager().call());
      setPlayers(await lottery.methods.getPlayers().call());
      setBalance(await web3.eth.getBalance(lottery.options.address));
    };

    loadStates();

    // Event listener for account changes
    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) {
        // MetaMask is locked or the user has disconnected their account
        setAccount("not connected");
        setIsConnected(false);
      } else {
        setAccount(accounts[0]);
        setIsConnected(true);
      }
    });

    // Event listener for disconnection
    window.ethereum.on("disconnect", (error) => {
      setAccount("not connected");
      setIsConnected(false);
    });

    // Cleanup event listeners on component unmount
    return () => {
      window.ethereum.removeListener("accountsChanged", () => {});
      window.ethereum.removeListener("disconnect", () => {});
    };
  }, []);

  const pickWinnerHandler = async (event) => {
    event.preventDefault();
    setMessage("Waiting for the Winner...");
    const winner = await lottery.methods.pickWinner().send({ from: account });
    setMessage("the winner is" + winner);
  };

  const connectWallet = async () => {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);
    setIsConnected(true);
  };

  const onEnterHandler = async (event) => {
    event.preventDefault();

    setMessage("Waiting on Transaction...");

    await lottery.methods.enter().send({
      from: account,
      value: web3.utils.toWei(valueToEnter, "ether"),
    });

    setMessage("You have been entered!");
  };

  return (
    <div>
      <h2>Lottery Contract</h2>
      <p>Current Contract {lottery.options.address}</p>
      <p>This contract is managed by {manager}</p>
      <p>Active Players in this round: {players.length}</p>
      <p>
        The current Prize of the round is {web3.utils.fromWei(balance, "ether")}{" "}
        ether
      </p>

      {isConnected ? <p>{account} is connected</p> : <p>No wallet connected</p>}

      <button onClick={connectWallet}>Connect Wallet</button>

      <hr />

      <h4>Want to try your luck?</h4>
      <form onSubmit={onEnterHandler}>
        <div>
          <label>Amount of Ether to enter (minimum is 0.0001 ETH)</label>
          <input
            onChange={(event) => {
              setValueToEnter(event.target.value);
            }}
            value={valueToEnter}
          ></input>
          <button type="submit">Enter</button>
        </div>
      </form>
      <hr />

      <h2>{message}</h2>

      <hr />

      <h4>pick a Winner</h4>
      <button onClick={pickWinnerHandler}>Pick a Winner</button>
    </div>
  );
}

export default App;
