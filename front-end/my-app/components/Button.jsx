import React, {useState, useContext} from 'react'
import { CrowdFundContext } from "../context/Crowdfund";
import { ethers } from 'ethers';
import {useRouter} from 'next/router';

//changes were made here

const Button = ({id, status, setStatus, owner, setRaisedAmt }) => {
    const crowdFund = useContext(CrowdFundContext);
    const [fundData, setFundData] = useState({amount: ""});
    const [waitForTransaction, setWaitForTransaction] = useState(false)
    const router = useRouter();
    

    async function handleFunding(e) {
        e.preventDefault();
        setWaitForTransaction(true)
        try{
          const fund_status = await crowdFund.fundCampaign(id, fundData.amount);
          if(fund_status){
            setStatus("Ongoing")
            setRaisedAmt(prev => {
                const total = parseFloat(prev) + parseFloat(fundData.amount);
                return total;
              })
          }
        }catch(e){
          console.log(e)
        }
        setWaitForTransaction(false)
      }
    
    function handleChange(event) {
        setFundData(prev => ({...prev, [event.target.name]: event.target.value}))
    }

    const evaluateCampaignResults = async () => {
        setWaitForTransaction(true)
        const campaign = await crowdFund.getCampaignById(id);
        const logs = await crowdFund.settleCampaign(id);
        if(logs[0].topics[0] === ethers.id("Success(uint256)")){
            setStatus("Success");
            window.localStorage.setItem(id, "Success");
        }
        if(logs[0].topics[0] === ethers.id("Failed(uint256)")){
            if(campaign.currAmt === '0.0'){
                setStatus("Failed And AbleToDelete");
                window.localStorage.setItem(id, "Failed And AbleToDelete");
            }else{
                setStatus("Failed");
                window.localStorage.setItem(id, "Failed");
            }
        }
        setWaitForTransaction(false) 
    }

    const handleDelete = async () => {
        setWaitForTransaction(true) 
        const deleted = await crowdFund.deleteCampaign(id);
        if(deleted) {
            window.localStorage.removeItem(id);
            router.push("/", undefined, {shallow: true});
        }
        setWaitForTransaction(false)
    }

    const handleRefund = async () => {
        setWaitForTransaction(true) 
        const hasLogs = await crowdFund.refundUser(id);
        if(hasLogs){
            setStatus("RefundComplete");
            window.localStorage.setItem(id, "RefundComplete");
        }
        setWaitForTransaction(false)
    }

    const handleCancel = async () => {
        setWaitForTransaction(true)
        const campaign = await crowdFund.getCampaignById(id);
        const cancelLog = await crowdFund.cancelCampaign(id);
        if(cancelLog){
            if(campaign.currAmt === '0.0'){
                setStatus("Cancelled And AbleToDelete");
                window.localStorage.setItem(id, "Cancelled And AbleToDelete");
            }else{
                setStatus("Cancelled");
                window.localStorage.setItem(id, "Cancelled");
            }
        }
        setWaitForTransaction(false)

    }

  return (
    <div>
        {
            status === "Ongoing" ? 
            (
                <div className='ongoing'>
                    <form className="fundForm" onSubmit={handleFunding}>
                        <input
                            type="text"
                            placeholder="input fundAmt in ether"
                            onChange={handleChange}
                            name="amount"
                            value={fundData.amount}
                            required
                            size= "50"
                        />
                        {
                            waitForTransaction ? <p>Wait a few secs for transaction to go thru...</p> :
                            <button className="Fund">Fund</button>
                        }
                    </form>
                    {
                        (owner === crowdFund.currAddress.toUpperCase() && !waitForTransaction) &&
                        (<button onClick={handleCancel} className="Cancel">Cancel</button>) 

                    }
                </div>
            ) 
            : status === "Expired" ? 
            (
                <div>
                    {
                    waitForTransaction ? <p>Wait a few secs for transaction to go thru...</p> : 
                    <button onClick={evaluateCampaignResults} className='expired-btn'>Expired.Click to see results.</button>
                    }
                </div>
                
            ) 
            :status === "Cancelled" || status === "Failed" ?
            (
                <div>
                   {
                   waitForTransaction ? <p>Wait a few secs for transaction to go thru...</p> : 
                   <button onClick={handleRefund} className='refund'>Refund</button>
                   } 
                </div>
            )
            :
            (
                <div>
                    {
                    waitForTransaction ? <p>Wait a few secs for transaction to go thru...</p> : 
                    <button onClick={handleDelete} className='delete'>Remove from listing</button>
                    }
                </div>
            )
        }
    </div>
  )
}

export default Button
