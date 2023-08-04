import React, {useState, useEffect} from 'react';
import {CROWDFUND_ABI, CROWDFUND_CONTRACT_ADDRESS} from '../../context/Constants';
import { ethers } from 'ethers';
import Button from "../../components/Button";
import Image from 'next/image';
require('dotenv').config();


const getData = async (id) => {
    let provider;
    if(process.env.ALCHEMY_API_KEY && CROWDFUND_CONTRACT_ADDRESS === "0x15663148Ae4f2b0b2f52C5Ef25f1ec6CC53Ed9E6"){
      provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/KQHIu6S27VTW8oInagzo4S2lDBj_vgnY");
    }else{
      provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/");
    }
   
    try{
        const contractInstance = new ethers.Contract(CROWDFUND_CONTRACT_ADDRESS, CROWDFUND_ABI, provider)
        const campaign = await contractInstance.campaigns(id);
        const date = new Date(ethers.toNumber(campaign.endTime) * 1000);
        const options = { timeZone: 'Asia/Singapore', timeZoneName: 'short' }
        const serialized_date = date.toLocaleString('en-SG', options);
        const decoded_campaign =  
          {
            id: ethers.toNumber(campaign.id),
            name: campaign.name,
            description: campaign.description,
            owner: campaign.owner,
            deadline: serialized_date,
            target: ethers.formatEther(campaign.targetAmt),
            currAmt: ethers.formatEther(campaign.currAmt),
            status: ethers.toNumber(campaign.status)
          }
        return decoded_campaign;
      }catch(e){
        console.log(e)
      }
}



const Campaign = ({campaign}) => {
  const [raisedAmt, setRaisedAmt] = useState(campaign.currAmt);
  const [status, setStatus] = useState("Ongoing");
 
  useEffect(() => {
    const checkTime =  () => {
      if(window.localStorage.getItem(campaign.id)){
        setStatus(window.localStorage.getItem(campaign.id));
        return 
      }
      const deadlineUnixTime = Date.parse(campaign.deadline) * 1000 * 60;
      const currDateTime = new Date();
      if((currDateTime.getTime() * 1000 * 60 > deadlineUnixTime)){
        setStatus("Expired");
        clearInterval(intervalId);
      }
    }

    const intervalId = setInterval(checkTime, 1000);
    
  }, [])

  return (
    
    <div className='campaign-page'>
      <h1 style={{textAlign: 'center'}}>Campaign Name: {campaign.name}</h1>
      <section className='campaign-details'>
        <div className='about'>
          <Image 
            src="/images/background1.jpeg"
            height={400}
            width={700}
          />
          <h2>About:</h2>
          <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            {campaign.description}</div>
          <p style={{fontFamily: 'sans-serif', marginTop: '60px'}}>Campaign launched by: {campaign.owner}</p>  
        </div>
        <div className='status-section'>
          <h3>Deadline : {campaign.deadline}</h3>
          <h4>Current Status: {status}</h4>
          <div className="progress">
              <strong>{`Target: ${campaign.target}`}</strong>
              <strong>{`Raised Amount: ${raisedAmt}`}</strong>
            </div>
            <div className="buttons">
              <Button id={campaign.id} status={status} setStatus={setStatus} owner={campaign.owner.toUpperCase()} setRaisedAmt={setRaisedAmt} />
            </div>
        </div>
      </section>
      
    </div>
  )
}

export  async function getServerSideProps(context) {
    const { id } = context.query;
    console.log(id)
    const campaign = await getData(Number(id));
    return {
        props : {
            campaign,
        }
    }
}

export default Campaign;
