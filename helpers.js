
const crypto = require('crypto');
const config = require('./config')
const helpers ={};




helpers.hashPassword = function(str){
    try{
            if(typeof(str) == 'string' && str.length>0)
            {
                var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
                return hash;
            }
            else{
                return false;
            }

    }catch(e)
    {
        return false;
    }
}




helpers.parseToObject = function(str)
{
    var dataOject = "";
    try{
           return dataOject = JSON.parse(str);


    }catch(e)
    {
        return {};
    }
}

helpers.randomString = function(strlength)
{
    if(typeof(strlength) == 'number'){
        const possibleCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";
        var str ="";

        for(i=0;i<=strlength;i++)
        {
            var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            str += randomCharacter;
        }
        return str;
    }
}
 
module.exports = helpers;