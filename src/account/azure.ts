import dotenv from "dotenv";
import { ContainerClient, BlockBlobClient } from "@azure/storage-blob";

dotenv.config();

export const Account = async (req:any,res:any) => {
    const sasUrl =process.env.BLOBSASURL;
    if(!sasUrl){
      console.log("No sasurl found");
      return;
    }
    const sourceFolder = "Nodejs/";
    const destinationFolder = "User/1/";

    const containerClient = new ContainerClient(sasUrl); 
    try {
        const  newfolder=containerClient.getBlockBlobClient(destinationFolder);
        await newfolder.upload("",0);
        const blobs = containerClient.listBlobsFlat({ prefix: sourceFolder });
        for await (const blob of blobs) {
          const sourceBlobName = blob.name;
          const destinationBlobName = sourceBlobName.replace(sourceFolder, destinationFolder);
          const sourceBlobClient = containerClient.getBlockBlobClient(sourceBlobName);
          const destinationBlobClient = containerClient.getBlockBlobClient(destinationBlobName);
          const copyPoller = await destinationBlobClient.beginCopyFromURL(sourceBlobClient.url);
          await copyPoller.pollUntilDone();

          console.log(`Blob ${sourceBlobName} copied successfully.`);
      }

      console.log("Folder contents copied successfully.")

        console.log("new folder ");
        res.json({message:"Succesfuul upload"});
      
  } catch (error) {
      console.error("Error during folder transfer:", error);
  }

   
};

