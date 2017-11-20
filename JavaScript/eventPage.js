prtime = 0
prtitle = "";
var Garr = []
console.log(55);
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) { 


  if(tab.status == 'complete'){
    
    if(tab.url != "chrome://newtab/" &&(prtitle != tab.title)){  //&&(prtitle != tab.title)
      
      var baseURL = getBaseURL(tab.url);
      var details = {};
      details["uId"] = tab.url 
      details["tId"] = tab.id;
	  Garr.push(details);
      prtime = Date.now();
      prtitle = tab.title;
      console.log(tab);
      console.log(Date.now());
      storeContains(baseURL+"0", function(){
        
        var obj = {};
        obj[baseURL+"0"] = prtime;
        chrome.storage.sync.set(obj);
        details["baseURL"] = prtime;
      },function(){
        
          chrome.storage.sync.get(baseURL+"0", v => details["baseURL"] = v[baseURL+"0"]);    
      });
      storeContains(tab.url+"1", function(){
        
        var obj = {};
        var iObj = {};
        obj[tab.url+"1"] = iObj;
		if(tab.openerTabId == undefined){
			
			details["Pid"] = 0;
		}
		else{
			chrome.tabs.get(tab.openerTabId, function(parentTab){
			  
			  details["Pid"] = parentTab.url;
			});
		}
        iObj["sWid"] = tab.windowId;
        details["sWid"] = tab.windowId;
        details["PrId"] = 0;           //PrId = Prescribed Id
        iObj["PrId"] = 0;
        chrome.storage.sync.set(obj);
      },function(){
        
          chrome.storage.sync.get(tab.url+"1", v => details["uId"] = v[tab.url+"1"]["id"]) ;
          if(tab.openerTabId == undefined){
			
			details["Pid"] = 0;
		  }
		  else{
			chrome.tabs.get(tab.openerTabId, function(parentTab){
			  
			  details["Pid"] = parentTab.url;
			});
		  }
          // details["Pid"] = parentTab.url;
          // });
          chrome.storage.sync.get(tab.url+"1", v => details["PrId"] = v[tab.url+"1"]["PrId"])
          chrome.storage.sync.get(tab.url+"1", v => details["sWid"] = v[tab.url+"1"]["sWid"]);
      });
      //Garr.push(details);
      chrome.windows.get(tab.windowId,{populate:true},function(window){
        
        if(window.tabs.length>=8){
          
		  console.log("Here");
          var neiArr = []
          var neiSim = []
          var Gwindow = []
          chrome.windows.getAll({"populate":true}, function (windows){
            windows.forEach(w => Gwindow.push(w.id));
            // Gwindow.push(windows.id);
          });
		  console.log("gw",Gwindow);
          chrome.tabs.query({}, function(allTab){
            console.log("all",allTab);
			  for (i in allTab){
				  if (!isNaN(i)){
					  console.log("isNan",i, allTab[i], allTab[i].id, allTab[i].url);
				  var g1 = Garr.find((v) => v.tId==allTab[i].id && v.uId==allTab[i].url);
				  sim = 0;
				  var neiObj = [];
				  console.log(1,g1);
				  if(g1!=undefined){
				  for (var j = 0; j < allTab.length; j++){
					
					com = 0;
					var g2 = Garr.find((v) => v.tId==allTab[j].id && v.uId==allTab[j].url);
					console.log("url",allTab[j].url);
					console.log("id",allTab[j].id);
					if (g2 != undefined){
						if(g1.baseURL == g2.baseURL){
						  
						  com = com+1;
						}
						if(g1.sWid == g2.sWid){
						  
						  com = com+1;
						}
						if((g1.Pid!=0)&&(g1.Pid == g2.Pid||g1.Pid == g2.tId)){
						  
						  com = com+1;
						}
						if(g1.PrIdd != 0 && g1.PrId == g2.PrId){
						  
						  com = com+2;
						}
						if(com>=2){
						  
						  neiObj.push(g2);
						  sim = sim+com
						}
						
		            //console.log(2,g1);
					}
				  console.log(3,g1);
				  
				  
				  
				  }
				  var Nobj = {};
				  //neiObj.push(g1);
				  Nobj["neig"] = neiObj;
				  Nobj["sim"] = sim;
				  neiArr[g1.tId.toString()+g1.uId] = Nobj; 
                  }				  
				  }
			  }
            
				count = allTab.length;
				console.log(count);
            //while(count>5){
				
              Max = getMax(neiArr,Gwindow);
			  console.log(Max);
			  console.log(neiArr)
              count = count-Max.length;
              for(var i =0 ;i<Max.length;i++){
                
                
                for(j in neiArr){
                  
                  if(j!="remove" && neiArr[j].neig.includes(Max[i])){
                    
                    neiArr[j].neig.remove(Max[i]);
                  }
                }
              }
              //var Mwindow = {};
              var ids = Max.map(v => v.tId); 
			  console.log(ids);
			  console.log(Gwindow);
              // if(Gwindow.length>1){
                
				// console.log("inise");
                // Mwindow = getMaxWindow(Max,Gwindow);
				// if(Mwindow == undefined ){
					  // if( ids[0] == undefined){
                      // console.log('out',ids);
					  // }
					  // else{
						  // console.log(ids);
						 // chrome.windows.create({},function(newWindow){
                
						 // Mwindow = newWindow.id;
						 // chrome.tabs.move(ids[0],{windowId:Mwindow.id,index:0})
                         // chrome.tabs.remove(newWindow.tabs[0].id)
                        // }); 
					 // }
				// }
				// else{
					// console.log("Another");
				  //console.log(Mwindow);
                  // chrome.tabs.move(ids,{windowId:Mwindow.id,index:-1})
                  // Gwindow.remove(Mwindow);
				// }
              //}
              //else{
                console.log("yeah");
                chrome.windows.create({},function(newWindow){
                  console.log("yup");
                  //Mwindow = newWindow.id;
                  chrome.tabs.move(ids,{windowId:newWindow.id,index:-1})
                  chrome.tabs.remove(newWindow.tabs[0].id)
                });
              //}
              //console.log(newWindow.id)
                //tabId = window.tabs.filter((t, i) => i > window.tabs.length - 6).map(v => v.id);
            //}
          });
        }
      });
    }
  }
});

function getMax(neiArr){
  max1 = 0;
  maxN = ""
  console.log(neiArr);
  //for(var i =0; i<neiArr.neig.length; i++){
    
  for (i in neiArr){
    if(i!="remove" && neiArr[i].sim>max1){
      
      max1 = neiArr[i].sim;
      maxN = neiArr[i].neig;
    }
  }
  return maxN;
}
function dragTab(tid, uid, Wid){
  
  var detail = Garr.find((v) => v.tId==tid && v.uId==uid);
  detail.PrId = Wid;
}
function storeContains(s, callback, callElse){
  return chrome.storage.sync.get(s, v => {if (v["g"]==undefined) callback(); else callElse()});
}

function getBaseURL(url){
  var parser = document.createElement('a');
	parser.href = url;
	return parser.hostname;
}

function getMaxWindow(Max, Gwindow){
  
  var LTemp = {};
  var Lt = '';
  for(var i = 0; i < Max.length; i++){
    
    if(Gwindow.includes(Max[i].sWid)){
      
      if(LTemp[Max[i].sWid] == undefined){
        LTemp[Max[i].sWid] = 1;
		Lt = Max[i].sWid
      }
      else{
        
        LTemp[Max[i].sWid] = LTemp[Max[i].sWid]+1;
      }      
    }
  }
  var LMax = 0;
  for(i in LTemp){
    
    if(LTemp[i]>LMax){
      
      Lt = i;
      LMax = LTemp;
    }
  }
  return Lt;
}

Array.prototype.remove = function (ele) {
    this.splice(this.indexOf(ele), 1);
}