import React, {useState, useEffect, createContext} from "react";
import { ethers } from 'ethers';
import {CROWDFUND_ABI, CROWDFUND_CONTRACT_ADDRESS} from './Constants';

export const CrowdFundContext = createContext();

export const CrowdFundManager = ({children}) => {
  const [isConnected, setIsconnected] = useState(false);
  const [connectedToHardhat, setConnectedToNetwork] = useState(false)
  const [currAddress, setCurrAddress] = useState("");
  
  const allowed_networks = [];
  
  if(CROWDFUND_CONTRACT_ADDRESS === "0x15663148Ae4f2b0b2f52C5Ef25f1ec6CC53Ed9E6"){
    allowed_networks.push("0xaa36a7")
  }else{
    allowed_networks.push("0x7a69")
  }

  const getContract = async (signerOrProvider) => 
    new ethers.Contract(CROWDFUND_CONTRACT_ADDRESS, CROWDFUND_ABI, signerOrProvider)

  useEffect(() => {
      const manageConnection =  () => {
          if(typeof window !== "undefined" && typeof window.ethereum !== "undefined"){
              window.ethereum.on("accountsChanged", handleAccountsChanged);
              window.ethereum.on('chainChanged', handleChainChanged);
              if(window.sessionStorage.getItem("connected") !== null){
                setIsconnected(true);
                setCurrAddress(window.sessionStorage.getItem("connected"))
              }
              if(window.sessionStorage.getItem("hardhat") !== null) setConnectedToNetwork(true);
          }
      }
  
      async function handleAccountsChanged() {
          const new_accounts = await window.ethereum.request({"method": "eth_accounts"});
          if(new_accounts.length === 0){
            window.sessionStorage.clear();
            setIsconnected(false);
            setCurrAddress("");
          }else{
              setCurrAddress(new_accounts[0]);
              window.sessionStorage.setItem("connected", new_accounts[0]);
          }
      }

      async function handleChainChanged() {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if(!allowed_networks.includes(chainId)){
            window.sessionStorage.removeItem('hardhat');
            setConnectedToNetwork(false);
            alert("You are on the wrong network.");
        }else{
          setConnectedToNetwork(true);
          window.sessionStorage.setItem("hardhat", true)
        }
      }

      manageConnection();
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
    }
  }, [])
  
  async function connect() {
      if(window){
          if(window.ethereum.isMetaMask){
              await window.ethereum.request({"method": "eth_requestAccounts"});
              const accounts = await window.ethereum.request({"method": "eth_accounts"});
              const chainId = await window.ethereum.request({ "method": 'eth_chainId' });
              setCurrAddress(accounts[0])
              setIsconnected(true);
              window.sessionStorage.setItem("connected", accounts[0])
              if(!allowed_networks.includes(chainId)){
                alert("You are on the wrong network.")
              } else{
                setConnectedToNetwork(true);
                window.sessionStorage.setItem("hardhat", true)
              }
          }else{
            alert("Pls install Metamask");
          }
      }
  }

  const launchCampaign = async (name, duration, target, description) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    try{
      const contractInstance = await getContract(signer);
      const tx_res = await contractInstance.launch(name, description, parseInt(duration), ethers.parseEther(target));
      await tx_res.wait();
      return true
    }catch(e){
      console.log(e)
      return false;
    }

  }

  const getAllCampaigns = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    try{
      const contractInstance = await getContract(provider);
      const campaigns = await contractInstance.getCampaigns();
      const decoded_campaigns = campaigns.map(campaign => (
        {
          id: ethers.toNumber(campaign.id),
          name: campaign.name,
          description: campaign.description,
          owner: campaign.owner,
          deadline: new Date(ethers.toNumber(campaign.endTime) * 1000),
          target: ethers.formatEther(campaign.targetAmt),
          currAmt: ethers.formatEther(campaign.currAmt),
          status: ethers.toNumber(campaign.status)
        }
      ))
      return decoded_campaigns;
    }catch(e){
      console.log(e)
    }
  }

  const getCampaignById = async (id) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    try{
      const contractInstance = await getContract(provider);
      const campaign = await contractInstance.campaigns(id);
      const decoded_campaign =  
        {
          id: ethers.toNumber(campaign.id),
          name: campaign.name,
          description: campaign.description,
          owner: campaign.owner,
          deadline: new Date(ethers.toNumber(campaign.endTime) * 1000),
          target: ethers.formatEther(campaign.targetAmt),
          currAmt: ethers.formatEther(campaign.currAmt),
          status: ethers.toNumber(campaign.status)
        }
      return decoded_campaign;
    }catch(e){
      console.log(e)
    }
  }

  const fundCampaign = async (id, amount) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    console.log(signer)
    const contractInstance = await getContract(signer);
    try{
      const tx_res = await contractInstance.fund(id, {value: ethers.parseEther(amount)});
      await tx_res.wait();
      return true;
    }catch(e){
      console.log(e)
    }
  }

  const settleCampaign = async (id) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    try{
      const signer = await provider.getSigner();
      const contractInstance = await getContract(signer);
      const tx_res = await contractInstance.withdraw(id);
      const tx_receipt = await tx_res.wait();
      return tx_receipt.logs;
    }catch(e){
      console.log(e)
    }
  }

  const cancelCampaign = async (id) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    try{
      const signer = await provider.getSigner();
      const contractInstance = await getContract(signer);
      const tx_res = await contractInstance.cancelCampaign(id);
      const tx_receipt = await tx_res.wait();
      if(tx_receipt.logs.length > 0){
        return true;
      }
    }catch(e){
      console.log(e)
    }
  }
  const refundUser = async (id) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    try{
      const signer = await provider.getSigner();
      const contractInstance = await getContract(signer);
      const tx_res = await contractInstance.refund(id);
      const tx_receipt =  await tx_res.wait();
      if(tx_receipt.logs.length > 0){
        return tx_receipt.logs
      }
      return false
    }catch(e){
      console.log(e)
    }
  }

  const deleteCampaign = async (id) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    try{
      const signer = await provider.getSigner();
      const contractInstance = await getContract(signer);
      const tx_res = await contractInstance.deleteCampaign(id);
      await tx_res.wait();
      return true;
    }catch(e){
      console.log(e)
    }
  }

  

  return (
    <CrowdFundContext.Provider 
        value = {{
            isConnected,
            connectedToHardhat,
            currAddress,
            launchSuccessful : false,
            getContract,
            connect,
            launchCampaign,
            getAllCampaigns,
            getCampaignById,
            fundCampaign,
            cancelCampaign,
            settleCampaign,
            refundUser,
            deleteCampaign,
        }}
    >
        {children}
    </CrowdFundContext.Provider>
  )
}
