import {ethers} from "ethers"

const Buy = ({state}) => {

    const buyRoom = async(event)=> {
        event.preventDefault();

const {contract} = state;
const name = document.querySelector("#name").value;
const message = document.querySelector("#message").value;
console.log(name,message,contract);
const amount = {value:ethers.utils.parseEther("0.01")};
const transaction = await contract.buyRoom(name,message,amount)
await transaction.wait();
console.log("transaction is done");

    };

return(
<>
 <h2 align="center">Book Room</h2>
<div className="container-md" style={{ width: "50%", marginTop: "25px" }}>
 
        <form onSubmit={buyRoom}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              placeholder="Enter Your Name"
            />
          </div>
         


          <div className="mb-3">
            <label className="form-label">check in date </label>
            <input
              type="text"
              className="form-control"
              id="message"
              placeholder="Enter dates"
            />  
            </div>
             <div className="mb-3">
            <label className="form-label">checkout date</label>
            <input
              type="text"
              className="form-control"
              id="message"
              placeholder="Enter dates"
            />  
          </div>


          <button
            type="submit"
            className="btn btn-primary"
            disabled={!state.contract}
          >
            Use Token
          </button>
        </form>
      </div>
    </>
  );
};
export default Buy;