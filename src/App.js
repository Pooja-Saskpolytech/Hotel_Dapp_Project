import abi from "./contract/hotel.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Buy from "./components/Buy";
import Memos from "./components/Memos";
import chai from "./chai.jpg";
import "./App.css";

function App() {
  const [state, setState] = useState({
    provider: null,
    signer: null,
    contract: null,
  });
  const [account, setAccount] = useState("None");
  useEffect(() => {
    const connectWallet = async () => {
      const contractAddress = "0xac0a1d5c37D7Ec71aAd07683d6f5EDA5F3279787";
      const contractABI = abi.abi;
      try {
        const { ethereum } = window;

        if (ethereum) {
          const account = await ethereum.request({
            method: "eth_requestAccounts",
          });

          window.ethereum.on("chainChanged", () => {
            window.location.reload();
          });

          window.ethereum.on("accountsChanged", () => {
            window.location.reload();
          });

          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
          );
          setAccount(account);
          setState({ provider, signer, contract });
        } else {
          alert("Please install metamask");
        }
      } catch (error) {
        console.log(error);
      }
    };
    connectWallet();
  }, []);
  // console.log(state);
  return (
    <div style={{ backgroundColor: "#EFEFEF", height: "%" }}>
   
      <h1 align="center" >Hotel Dapp</h1>
      <div className="d-flex flex-column justify-content-center align-items-center my-5">
      <p
        class="text-muted lead "
        style={{ marginTop: "10px", marginLeft: "5px" }}
      >
        <small>Connected Account - {account}</small>
      </p>
      
      <label className="form-label">Number of token you want to buy</label>
            <input
           
              placeholder="Enter Number"
            />

      <button
            type="submit"
            className="btn btn-primary"
            disabled={!state.contract}
          >
            Buy Token
          </button>
          <p>
          </p>

          <label className="form-label">Get Token Balance</label>
            <input
           
              placeholder="Enter Address"
            />

      <button
            type="submit"
            className="btn btn-primary"
            disabled={!state.contract}
          >
            Get Token Balance
          </button>
          <p>
          </p>
          <label className="form-label">Get token Price</label>
           
          <button
            type="submit"
            className="btn btn-primary"
          
          >
          Get Token Price
          </button>

          <p>

          <p>
          </p>


          <label className="form-label">Check Room Availability</label>
            <input
           
              placeholder="Enter Date"
            />
          <button
            type="submit"
            className="btn btn-primary"
          
          >
          Get Availability
          </button>
            
        



          <p>
          </p>
      
      <label className="form-label">Cancel booking and get Refund</label>
        <input
       
          placeholder="Enter Checkin date"
        />
      <button
        type="submit"
        className="btn btn-primary"
      
      >
        Cancel Booking and refund
      </button>


      </p>
  

      <div className="container">
        <Buy state={state} />
        <Memos state={state} />
      </div>

     </div>
     
    </div>
  );
}





export default App;