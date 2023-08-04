import React, {useState, useContext} from "react";
import { CrowdFundContext } from "../context/Crowdfund";


const Form = ({ setCampaigns }) => {
  const connectionStatus = useContext(CrowdFundContext);
  const connectedToHardhat = connectionStatus.connectedToHardhat;
  const isConnected = connectionStatus.isConnected;

  const [launchOutcome, setLaunchOutcome] = useState("");
  const [formData, setFormData] = useState({
    campaignName : "",
    duration: "",
    targetAmt: "", 
    description: ""
  })

  const handleChange = (event) => {
    setFormData(prevData => {
        return {...prevData, [event.target.name] : event.target.value}
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLaunchOutcome("Wait for transaction to go thru...")//this was edited....
    const {campaignName, duration, targetAmt, description} = formData;
    const outcome = await connectionStatus.launchCampaign(campaignName, duration, targetAmt, description);
    if(outcome) {
      const fetchedCampaigns = await connectionStatus.getAllCampaigns();
      setCampaigns(fetchedCampaigns)
      setLaunchOutcome("Campaign was successfully launched");
    }
    else setLaunchOutcome("Campaign launch failed...pls try again");
  }

  return (
    <div className='formSection'>
      {
        connectedToHardhat && isConnected ? 
        (
            <div className="formContainer">
                <form onSubmit={handleSubmit}>
                  <h3>Launch a new Campaign</h3>
                    <label>
                        Title
                    <input
                        type="text"
                        placeholder="What is the name of your campaign?"
                        onChange={handleChange}
                        name="campaignName"
                        value={formData.campaignName}
                        required
                    />
                    </label>
                    
                    <label>
                        Total Duration
                        <input
                            type="text"
                            placeholder="What is the duration of your campaign in secs?"
                            onChange={handleChange}
                            name="duration"
                            value={formData.duration}
                            required
                        />
                    </label>
                    
                    <label>
                        Target Amount
                        <input
                            type="text"
                            placeholder="What is your target amount in eth?"
                            onChange={handleChange}
                            name="targetAmt"
                            value={formData.targetAmt}
                            required
                        />
                    </label>
                    
                    About 
                    <textarea 
                        value={formData.description}
                        placeholder="Give a description about your campaign"
                        onChange={handleChange}
                        name="description"
                    />
                    <button className="createBtn">Create Campaign</button>
                </form>
                <p style={{ color: launchOutcome === "Campaign was successfully launched" ? 
                'green' : 'red'}}>
                  {launchOutcome}
                </p>
            </div>
            
        ) : 
        (
          <div style={{color: 'white'}}>
            <h3>Connect your Metamask wallet to view or create campaigns.</h3>
            <h3>Make sure you are connected to the right network!</h3>
          </div>
          
        )
      }
      
    </div>
  )
}

export default Form
