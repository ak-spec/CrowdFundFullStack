import Image from "next/image";
import React from "react";
import Link from "next/link";

const Card = ( { campaign }) => {
  const image_id = Number(campaign.id) % 2 + 1;  
  const src = `/images/cardImage${image_id}.jpeg`;  
  const link = `/campaign/${campaign.id}`
                 
  return (
    <div className="card">
          <Link href={link}>
          <Image
            src={src}
            height={250}
            width={499}
            alt="cannot load image"
          />
          </Link>
        <div>
          <h2 style={{margin: '5px', padding: '0px'}}>{campaign.name}</h2>
          <p style={{margin: '5px', padding: '0px'}}>{campaign.description}</p>
          <p style={{margin: '5px', padding: '0px'}}><strong>Deadline: {campaign.deadline.toString()}</strong></p>
        </div>
    </div>
  )
}

export default Card
