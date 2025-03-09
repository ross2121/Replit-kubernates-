import fs from "fs"

export const createfile=(text:string)=>{
fs.writeFile("File/",text, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
}); 
}