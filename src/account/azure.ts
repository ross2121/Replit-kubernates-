import dotenv from "dotenv";
import fs  from "fs";
import { ContainerClient, BlockBlobClient } from "@azure/storage-blob";
import path from "path";
dotenv.config();
export const Account = async (language:string,userid:string) => {
    const sasUrl =process.env.BLOBSASURL;
    if(!sasUrl){
      console.log("No sasurl found");
      return;
    }
    const sourceFolder = `${language}/`;
    const destinationFolder = `User/${userid}/${language}/`;
    const containerClient = new ContainerClient(sasUrl); 
    try {
        const  newfolder=containerClient.getBlockBlobClient(destinationFolder);
        await newfolder.upload("",0);
        const blobs = containerClient.listBlobsFlat({ prefix: sourceFolder });
        for await (const blob of blobs) {
          const sourceBlobName = blob.name;
          console.log("blobb name",sourceBlobName);
          const destinationBlobName = sourceBlobName.replace(sourceFolder, destinationFolder);
          const sourceBlobClient = containerClient.getBlockBlobClient(sourceBlobName);
          const destinationBlobClient = containerClient.getBlockBlobClient(destinationBlobName);
          const copyPoller = await destinationBlobClient.beginCopyFromURL(sourceBlobClient.url);
          await copyPoller.pollUntilDone();
      }
      console.log("Folder contents copied successfully.")
        console.log("new folder ");    
  } catch (error) {
      console.error("Error during folder transfer:", error);
  }
};
export const fetchfile=async(language:string,userid:string)=>{
   const sasurl=process.env.BLOBSASURL;
   if(!sasurl){
    return; 
   }
   const container=new ContainerClient(sasurl);
   const folder=`User/${userid}/${language}/`;
   const blobs=container.listBlobsFlat({prefix:folder});    
   console.log(blobs); 
   for await(const blob of blobs){
          console.log("blobname",blob.name);
          if(blob.name==`User/${userid}/${language}/`){
            console.log("leee");
              container.deleteBlob(blob.name);
              continue;
          }
          console.log("check222");
          const blobclient=container.getBlobClient(blob.name);
          console.log("blobclient",blob.name);
          const download=await blobclient.download();
          const localFilePath = path.join('/PRoject/Replit/File',blob.name);
          console.log(localFilePath);
            const localDir = path.dirname(localFilePath);
            console.log("locaal dir",localDir);
                fs.mkdirSync(localDir, { recursive: true });
          const fileStream = fs.createWriteStream(localFilePath);
          await new Promise((resolve, reject) => {
            // @ts-ignore
              download.readableStreamBody.pipe(fileStream)
                  .on("error", reject)
                  // @ts-ignore
                  .on("finish", resolve);
          });
       
      //  console.log(data);
    
    
   }
}


