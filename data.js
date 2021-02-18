const fs = require('fs');
const helpers = require('./helpers');

const lib = {};


lib.create = function(dir,file,data,callback){
    //check wheather file exist or not

        fs.open(dir+"/"+file+".json",'wx',function(err,fileDescriptor){
                if(!err && fileDescriptor)
                {
                        //convert data to json 
                        const stringData = JSON.stringify(data);
                        fs.writeFile(fileDescriptor,stringData,function(err){
                            if(!err)
                            {
                                fs.close(fileDescriptor,function(err){
                                        if(!err){
                                            callback(false);
                                        }
                                        else{
                                            callback(504,"Error in closing the file");
                                        }
                                })
                            }
                            else{
                                callback(504,"Cant write to file");
                            }
                        })
                }
                else{
                    callback(404,"could not create the file, It may already exist");
                }
        })
}




//Read the data from the file

lib.read = function(dir,file,callback){
    fs.readFile(dir+'/'+file+'.json','utf8',function(err,data){
        if(!err && data){
          const parsedData =  helpers.parseToObject(data);
            callback(false,parsedData)
        }else{
            callback(404,"file not found");
        }
    })
}




//Update the data in file

lib.update = function(dir,file,data,callback){
    //open the file for updation 
    fs.open(dir+'/'+file+'.json','r+',function(err,fileDescriptor){
        if(!err && fileDescriptor){
                const stringData = JSON.stringify(data);
    
                fs.appendFile(fileDescriptor,stringData,function(err){
                    if(!err){
                                fs.close(fileDescriptor,function(err){
                                    if(!err){
                                            callback(false, 'User info updated Successfully' )
                                    }else{
                                        callback(500, 'Could not close the file' )
                                    }
                                })
                    }else{
                        callback(500, 'Can not update the file' );
                    }
                })
        }else{
            callback(400,  'User Not Found' );
        }
    })
    }
    
    lib.delete = function(dir,file,callback){
    
        fs.unlink(dir+'/'+file+'.json',function(err){
            if(!err){
                callback(false,  'User Deleted Successfully' )
            }
            else{
                callback(500, 'Could Not Delete the flie' )
            }
        })
    
    }
    
    
    
    

 

module.exports = lib;