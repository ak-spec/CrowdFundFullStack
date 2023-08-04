import React, {useState, useEffect, useContext} from "react";
import { CrowdFundContext } from "../context/Crowdfund";
import Card from '../components/Card';
import Form from '../components/Form';


export default function Home() {
  const connectionStatus = useContext(CrowdFundContext);
  const connectedToHardhat = connectionStatus.connectedToHardhat;
  const isConnected = connectionStatus.isConnected;
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const initialiseCampaigns = async () => {
      const fetchedCampaigns = await connectionStatus.getAllCampaigns();
      setCampaigns(fetchedCampaigns);
    }
    

    initialiseCampaigns();
  }, [])

  const cards = campaigns?.map(campaign => <Card campaign={campaign} key={campaign.id}/>);

  return (
    <div className='mainBody'>
        <div className='hero'>
          <h1 style={{color:'#ffa500'}}>Welcome to the funding platform!</h1>
          <Form setCampaigns={setCampaigns}/>
        </div>
          {
            connectedToHardhat && isConnected &&
            (
              <div className='cards-section'>
                <h2 style={{textAlign: 'center'}}>All Listed Campaigns</h2>
                <div className='card-container'>
                    {cards}
                </div>
              </div>
            )
          }
        
    </div>
    
  )
}
