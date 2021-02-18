 
 
const _data = require('./data');
const { hashPassword } = require('./helpers');
const helpers = require('./helpers');


const handlers = {};

handlers.users = function(data,callback){

    const accetableMethods = ['post','put','get','delete'];

        if(accetableMethods.indexOf(data.method) > -1){
                handlers._users[data.method] (data,callback);

           
        }else{
            callback(405,"Invalid Method");
        }
 
}


handlers._users={};


//post method

handlers._users.post = function(data,callback){
    
    const name = typeof(data.payload.name) == 'string' && data.payload.name.trim().length >0 ? data.payload.name.trim(): false;
    const email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length >0 ? data.payload.email.trim(): false;
    const address = typeof(data.payload.address) == 'string' && data.payload.address.trim().length >0 ? data.payload.address.trim(): false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim(): false;
 
  
    if(name && email && address && password)
    {
        
        _data.read("usersData",email,function(err,data){
            if(err)
            { 
                
                
                    //hash the password 

                    const hashedPassword = helpers.hashPassword(password)
                     if(hashedPassword)
                     {
                        const userObject = {
                            'name' : name,
                            "email" : email,
                            "address" : address,
                            "password" : hashedPassword
                        }
                        _data.create('usersData',email, userObject,function(err){
                            if(!err){
                                callback(false,'User created Successfully');
                            }
                            else{
                                callback(501,'Can not create this user');
                            }
                        })

                     }else{
                         callback(500,"Could Not Hashed the password")
                     }



                  

            }
            else{
                
                callback(404,'could not   create user, It May exist already');
            }
        });

    }else
    {
        callback(404,'Missing Required Field')
    }

}

//_users get 

handlers._users.get = function(data,callback){

    const email = typeof(data.querStringObject.email) == 'string' && data.querStringObject.email.trim().length >0 ? data.querStringObject.email.trim(): false;


        if(email){


             //get the token form the headers
              const token = typeof(data.headers.token) == 'string'? data.headers.token : false;

              handlers._tokens.verifyToken(token,email,function(isValidToken){
                  if(isValidToken)
                  {
                       
                    
                       _data.read("usersData",email,function(err,data){
                if(!err && data){
                    delete data.password
                    callback(200,data);
                }else
                {
                    callback(500,"User Does Not Exist");
                }
            })
                       
                  }else{
                      callback(500,"Invalid Token")
                  }
              })

           
           
        }
        else{
            callback(503,"not a valid email");
        }
};


//_put
//Required Data Email
//optional data name, address,password
handlers._users.put = function(data,callback){
    const name = typeof(data.payload.name) == 'string' && data.payload.name.trim().length >0 ? data.payload.name.trim(): false;
    const email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length >0 ? data.payload.email.trim(): false;
    const address = typeof(data.payload.address) == 'string' && data.payload.address.trim().length >0 ? data.payload.address.trim(): false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim(): false;
 
  if(email){
  //get the token form the headers
  const token = typeof(data.headers.token) == 'string'? data.headers.token : false;

  handlers._tokens.verifyToken(token,email,function(isValidToken){
      if(isValidToken)
      {
        if(name || address || password)
        {
            _data.read("usersData",email,function(err,userData){
                if(!err && userData){
                        if(name){
                            userData.name = name;
                        }
                        if(address)
                        {
                            userData.address = address;
                        }
                        if(password){
                                   const hashedPassword = helpers.hashPassword(password);
                                    if(hashedPassword){
                                        userData.password = hashedPassword;
                                    }
                                    else{
                                        callback(500,"Could Not hash the password");
                                    }
                           
                        }

                            _data.update("usersData",email,userData,function(err){
                                if(!err){       
                                        callback(false,"User Data Updated");

                                }else{
                                    callback(503,"Can not update the user")
                                }
                            })

                }else{
                    callback(404,"User Not Found");
                }
            })
        }
        else{
            callback(503, "Missing Update Field");
        }
      }
      else{
          callback(500,"Invalid or Expired")
      }
    })

            

  }
  else{
      callback(404,"Invalid Email");
  }
}


//_delete
//Required Data Email

handlers._users.delete = function(data,callback){
    const email = typeof(data.querStringObject.email) == 'string' && data.querStringObject.email.trim().length >0 ? data.querStringObject.email.trim(): false;

        if(email){

  //get the token form the headers
  const token = typeof(data.headers.token) == 'string'? data.headers.token : false;

  handlers._tokens.verifyToken(token,email,function(isValidToken){
      if(isValidToken)
      {
        _data.delete("usersData",email,function(err){
            if(!err){
                callback(false,"User Deleted Successfully");
            }
            else{
                callback(500,"Could Not Delete User");
            }
        })

      }
      else{
        callback(500,"Invalid Or Expired Token");
      }
    });


                
        }else{
            callback(404,"User Does not exist");
        }

}



//tokens

 
handlers.tokens = function(data,callback){

    const accetableMethods = ['post','put','get','delete'];

        if(accetableMethods.indexOf(data.method) > -1){
                handlers._tokens[data.method] (data,callback);

           
        }else{
            callback(405,"Invalid Method");
        }
 
}

//container for tokens sub method
//Required data Email and Password
handlers._tokens = {};

handlers._tokens.post = function(data,callback){
     const email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length >0 ? data.payload.email.trim(): false;
     const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length >0 ? data.payload.password.trim(): false;

    if(email && password)
    {   
            _data.read("usersData",email,function(err,userData){
                if(!err && userData){


                          const  hashedPassword = helpers.hashPassword(password);

                        if(hashedPassword){



                        //check the email and password
                        if(userData.password === hashedPassword)
                        {
                            const tokenId = helpers.randomString(20);
                            const expires = Date.now()+1000 * 60 *60;
                            const tokenObject = {
                                "email" : email,
                                "tokenId" : tokenId,
                                "expires" : expires
                            }
                            _data.create("usersData/tokens", tokenId, tokenObject, function(err){
                                if(!err){
                                    callback(false,tokenId);
                                }else{
                                    callback(500,"Can not create a token")
                                }
                            })
                            
                        }
                        else{
                                callback(500,"Invalid email and password")
                        }




                        }else{
                            callback(500, "Error in hashing the password");
                        }




                }else{
                    callback(404,"User Not Found");
                }
            })

    } else{
        callback(500,"Missing Login Details");
    }
}


//required data token id
handlers._tokens.get = function(data,callback){
    const id = typeof(data.querStringObject.id) == 'string' && data.querStringObject.id.trim().length > 0 ? data.querStringObject.id.trim() : false;

    if(id){

            _data.read("usersData/tokens",id,function(err,tokenData){
                if(!err && tokenData)
                {
                    callback(false,tokenData);
                }else{
                    callback(500,"Can Not read toekn Data");
                }
            })
    }else{
        callback(404,"Token Not found");
    }
}

//Required Data, id, extend
handlers._tokens.put = function(data,callback){
    const id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length >0 ? data.payload.id.trim(): false;
    var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;

    if(id && extend)
    {
        
        _data.read("usersData/tokens",id,function(err,tokenData){
            if(!err && tokenData)
            {
                    if(tokenData.expires> Date.now()){
                             // Set the expiration an hour from now
                         tokenData.expires = Date.now() + 1000 * 60 * 60;
                         _data.update("usersData/tokens",id,tokenData,function(err){
                             if(!err){
                                 callback(false,"Token is updated");
                             }else{
                                 callback(500,"Can't Update the token");
                             }
                         })
                    }
                    else{
                        callback(500,"Token is Expired");
                    }
                
            }else{
                callback(500,"Can Not read toekn Data");
            }
        })

    }else{
        callback(404,"Missing Required Field");
    }
  

}

//requied Data : id
handlers._tokens.delete = function(data,callback){
    const id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length >0 ? data.payload.id.trim(): false;
    if(id){
                _data.delete("usersData/tokens",id,function(err){
                    if(!err){
                        callback(false,"Token Deleted");
                    }else{
                        callback(500,"Can not delete the token");
                    }
                })
    }else{
        callback(404,"Invalid token Id");
    }
}






//varify given token is valid for current user

handlers._tokens.verifyToken = function(id,email,callback){
    //lookup for token
   
    _data.read("usersData/tokens",id,function(err,tokenData){
        if(!err && tokenData)
        {
                if(tokenData.email == email && tokenData.expires > Date.now()){
                   
                    callback(true);
                }else{
                    callback("Fale is called");
                    callback(false);
                }
        }else{
            console.log("token id is "+id);
            callback(false);
        }
    })
    
    }














 

    handlers.menu = function(data,callback){
    
        const accetableMethods = [ 'get','delete'];
    
            if(data.method == 'get'){
                    handlers._menu[data.method] (data,callback);
    
               
            }else{
                callback(405,"Invalid Method");
            }
     
    }
    
    
    handlers._menu={};

    handlers._menu.get = function(data,callback){
        menu_item = {
            'items' : [
              { 'id' : '1',  'name' : 'Margherita',  'size' : 'S', 'price_cents': 1000 },
              { 'id' : '2',  'name' : 'Margherita',  'size' : 'M', 'price_cents': 1300 },
              { 'id' : '3',  'name' : 'Margherita',  'size' : 'L', 'price_cents': 1500 },
              { 'id' : '4',  'name' : 'Pepperoni',   'size' : 'S', 'price_cents': 1000 },
              { 'id' : '5',  'name' : 'Pepperoni',   'size' : 'M', 'price_cents': 1300 },
              { 'id' : '6',  'name' : 'Pepperoni',   'size' : 'L', 'price_cents': 1500 },
              { 'id' : '7',  'name' : 'Tropical',    'size' : 'S', 'price_cents': 1000 },
              { 'id' : '8',  'name' : 'Tropical',    'size' : 'M', 'price_cents': 1300 },
              { 'id' : '9',  'name' : 'Tropical',    'size' : 'L', 'price_cents': 1500 },
              { 'id' : '10', 'name' : 'Four-Cheese', 'size' : 'S', 'price_cents': 1000 },
              { 'id' : '11', 'name' : 'Four-Cheese', 'size' : 'M', 'price_cents': 1300 },
              { 'id' : '12', 'name' : 'Four-Cheese', 'size' : 'L', 'price_cents': 1500 }
            ]
          }
      callback(false,menu_item)
    }











    handlers.cart = function(data,callback){
    
        const accetableMethods = ['post','put','get','delete'];
    
            if(accetableMethods.indexOf(data.method) > -1){
                    handlers._cart[data.method] (data,callback);
    
               
            }else{
                callback(405,"Invalid Method");
            }
     
    }



    
    handlers._cart={};
    
    //handlers post
handlers._cart.post = function(data,callback){

    const pizza_id = typeof(data.payload.pizza_id) == 'number'   ? data.payload.pizza_id: false;
    const quantity = typeof(data.payload.quantity) == 'number'   ? data.payload.quantity: false;

    if(pizza_id && quantity){
        console.log(pizza_id +" "+quantity);

        
        callback(false,"Good Request")
    }else{
        callback(500,"Bad Request")
    }
}

    //handlers post
    handlers._cart.get = function(data,callback){

        callback(false,"Cart is Called");
}

    //handlers post
    handlers._cart.put = function(data,callback){

        callback(false,"Cart is Called");
}
    //handlers post
    handlers._cart.delete = function(data,callback){

        callback(false,"Cart is Called");
}


handlers.notFound = function(data,callback){
    callback(404,'invalid URL')
}


module.exports = handlers;