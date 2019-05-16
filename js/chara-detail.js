    $.holdReady(true);
    var db = {};
    var d0 = $.getJSON("json/excel/building_data.json",function(data){
            db["manufactformulas"] = data.manufactFormulas;
        });
    var d1 = $.getJSON("json/excel/building_data.json",function(data){
            db["workshopformulas"] = data.workshopFormulas;
        });
    var d2 = $.getJSON("json/excel/character_table.json",function(data){
            db["chars"] = data;
        });
    var d3 = $.getJSON("json/excel/item_table.json",function(data){
            db["items"] = data.items;
        });
    var d4 = $.getJSON("json/tl-akhr.json",function(data){
            db["chars2"] = data;
        });
    var d5 = $.getJSON("json/tl-type.json",function(data){
            db["classes"] = data;
        });
    var d6 = $.getJSON("json/tl-tags.json",function(data){
            db["tags"] = data;
        });
    var d7 = $.getJSON("json/akmaterial.json",function(data){
            db["itemstl"] = data;
        });
    var d8 = $.getJSON("json/excel/gamedata_const.json",function(data){
            db["dataconst"] = data;
        });
    var d9 = $.getJSON("json/excel/skin_table.json",function(data){
            db["skintable"] = data;
        });
    var d10 = $.getJSON("json/tl-gender.json",function(data){
            db["gender"] = data;
        });
    $.when(d0,d1,d2,d3,d4,d5,d6,d7,d8,d9,d10).then(function(){
        $.holdReady(false);
    });

    var lang;
    var reg;
    var selectedOP;

    $(document).ready(function(){
        $('#to-tag').click(function(){      // When arrow is clicked
            $('body,html').animate({
                scrollTop : 0                       // Scroll to top of body
            }, 500);
        });

        $(window).click(function() {
            $('#operatorsResult').html("");
            $('#operatorsResult').hide();
        });
        $('#operatorsResult').click(function(event){
            event.stopPropagation();
        });
        $('#opBrowseButton').click(function(event){
            event.stopPropagation();
        });
        $('#opname').click(function(event){
            event.stopPropagation();
        });

        if(typeof localStorage.gameRegion === "undefined" || localStorage.gameRegion == ""|| localStorage.webLang == ""){
            console.log("game region undefined");
            localStorage.setItem("gameRegion", 'cn');
            localStorage.setItem("webLang", 'en');
            reg = "cn";
            lang = "en";

            var vars = getUrlVars();
            if(typeof vars.opname != "undefined"){
                console.log("TEST1")
            }
        } else {
            console.log(localStorage.webLang);
            reg = localStorage.gameRegion;
            lang = localStorage.webLang;
        }
        if(typeof localStorage.selectedOPDetails === "undefined" || localStorage.selectedOPDetails == ""){
            console.log("selected OP undefined");
            var vars = getUrlVars();
            if(typeof vars.opname != "undefined"){
                var char = query(db.chars,"appellation",vars.opname,true,true);
                var opname;
                $.each(char,function(key,v){
                    opname = v.name;
                });
                selectOperator(opname);
            } else {
                localStorage.setItem("selectedOP","");
            }
        } else {
            console.log("selected OP defined");
            var curpath = window.location.search.split("?");
            if(typeof curpath[1] != "undefined"){
                var variables = curpath[1].split("?");
                var char = {};
                $.each(variables,function(_,v){
                    var subvar = v.split("=");
                    if(subvar[0] == "opname"){
                        char = query(db.chars,"appellation",subvar[1].replace(/_/g," "),true,true);
                    }
                });
                var opname;
                $.each(char,function(key,v){
                    opname = v.name;
                })
            } else {
                selectedOP = localStorage.selectedOPDetails;
                var opname = db.chars[selectedOP].name;
            }
            selectOperator(opname);
        }

        console.log("TEST")
        $('.reg[value='+reg+']').addClass('selected');
        $('.lang[value='+lang+']').addClass('selected');
    });

    function populateOperators(el){
        // console.log(el)
        if(($('#operatorsResult').css("display") == "block") && el=="Browse"){
            // console.log($('#operatorsResult').css("display") == "none" )
            $('#operatorsResult').hide();
            return;
        }
        if(el.value != ""||el=="Browse"){
            var result = [];
            $.each(db.chars2,function(_,char){
                var languages = ['cn','en','jp','kr'];
                var found = false;
                if(el=="Browse"){
                    
                    found=true;
                }else{
                    for (var i = 0; i < languages.length; i++) {
                        var charname = eval('char.name_'+languages[i]).toUpperCase();
                        var input = el.value.toUpperCase();
                        var search = charname.search(input);
                        if(search != -1){
                            found = true;
                            break;
                        };
                    }
                }
                if(found){
                    // console.log(char)
                    var name_cn = char.name_cn;
                    var name = eval('char.name_'+reg);
                    var nameTL = eval('char.name_'+lang);
                    var img_name = query(db.chars,"name",char.name_cn,true,true); 
                    // console.log(Object.keys(img_name))
                    var rarity = img_name[Object.keys(img_name)] ? img_name[Object.keys(img_name)].rarity + 1 : 0;
                    // console.log(rarity);
                    if(rarity!=0)
                    result.push({'name':name,'name_cn':name_cn,'nameTL':nameTL,'img_name':Object.keys(img_name),rarity});
                }
            });
            console.log(result)
            result.sort((a,b)=> b.rarity-a.rarity)
            if(result.length > 0){
                $('#operatorsResult').html("");
                $('#operatorsResult').show();
                for (var i = 0; i < result.length; i++) {
                    let image = `<img style="height:40px;padding:2px" src="./img/avatars/${result[i].img_name}_1.png">  `
                    // console.log(image)
                    $("#operatorsResult").append(
                            "<li class=\"col-2 col-sm-1 ak-shadow-small ak-rare-"+result[i].rarity+"\"style=\"display:inline-block;cursor: pointer;width:75px;margin:2px;margin-bottom:2px;padding:1px;border-radius:2px\" onclick=\"selectOperator('"+result[i].name_cn+"')\">"
                            +"<div style=\"white-space: nowrap;padding:0px;text-align:center;margin:0 \">"+image+"</div>"
                            +"<div style=\"white-space: nowrap;padding:0px;text-align:center;margin:0 \">"+result[i].nameTL+"</div>"
                            +"</li>");
                }
            }
            console.log( $("#operatorsResult")  )
            // $('#operatorsResult').show();
        } else {
            $('#operatorsResult').html("");
            $('#operatorsResult').hide();
        }
    }

    function selectOperator(opname){
        if(opname != ""){
            $("#chara-detail-container").show();
            console.log("SELECT OPERATOR");
            console.log(opname);   
            $("#opname").val("");
            $('#operatorsResult').html("");
            $('#operatorsResult').hide();
            var opdata = query(db.chars2,"name_cn",opname);
            var opclass = query(db.classes,"type_cn",opdata.type);
            var opdata2 = query(db.chars,"name",opdata.name_cn,true,true);
            var opdataFull = {};
            $.each(opdata2,function(key,v){
                v['id'] = key;
                console.log(v);
                opdataFull = v;
                localStorage.selectedOPDetails = key;
                return false
            });
            var curpath = window.location.pathname.split("?");
            history.pushState(null, '', curpath+'?opname='+opdataFull.appellation.replace(/ /g,"_")); 


            // use opdata to get the operator data based on tl-akhr.json
            // use opdataFull to get the operator data based on character_table.json

            // Get operator elite skins
            var skinList = db.skintable.buildinEvolveMap[opdataFull.id];
            console.log(skinList);

            var tabbtn = [];
            var tabbtn2 = [];
            var tabcontent = [];
            var tabcontent2 = [];
            
            $("#elite-sidenav").html("");
            $("#tabs-opCG").html("");
            $("#elite-topnav").html("");
            $("#tabs-opData").html("");
            $("#op-taglist").html("");

            for (var i = 0; i < opdataFull.phases.length; i++) {
                var l = opdataFull.phases.length;
                if(i == 0){
                    if(l == 1){
                        tabbtn[l] = $("<li class='nav-item'><button class='btn tabbing-btns active'>"
                            + "<img src='img/ui/elite/0-s.png' data-toggle='pill' href='#opCG_0_tab'></button></li>");
                        tabbtn2[i] = $("<li class='nav-item'><a class='btn tabbing-btns horiz nav-link active' data-toggle='pill' href='#elite_0_tab'>Elite 0</a></li>");
                    } else {
                        tabbtn[l] = $("<li class='nav-item'><button class='btn tabbing-btns tabbing-btns-bottom active' data-toggle='pill' href='#opCG_"+i+"_tab'>"
                                            + "<img src='img/ui/elite/0-s.png'></button></li>");
                        tabbtn2[i] = $("<li class='nav-item'><a class='btn tabbing-btns horiz tabbing-btns-left nav-link active' data-toggle='pill' href='#elite_"+i+"_tab'>Elite "+i+"</a></li>");
                    }
                } else if( i == l-1 ){
                    tabbtn[0] = $("<li class='nav-item'><button class='btn tabbing-btns tabbing-btns-top' data-toggle='pill' href='#opCG_"+i+"_tab'>"
                                            + "<img src='img/ui/elite/"+i+"-s.png'></button></li>");
                    tabbtn2[i] = $("<li class='nav-item'><a class='btn tabbing-btns horiz tabbing-btns-right nav-link' data-toggle='pill' href='#elite_"+i+"_tab'>Elite "+i+"</a></li>");
                } else {
                    tabbtn[l-i] = $("<li class='nav-item'><button class='btn tabbing-btns tabbing-btns-middle' data-toggle='pill' href='#opCG_"+i+"_tab'>"
                                            + "<img src='img/ui/elite/"+i+"-s.png'></button></li>");
                    tabbtn2[i] = $("<li class='nav-item'><a class='btn tabbing-btns horiz tabbing-btns-middle nav-link' data-toggle='pill' href='#elite_"+i+"_tab'>Elite "+i+"</a></li>");
                }

                var skindata;
                if(!(skinList[i] in db.skintable.charSkins)){
                    skindata = db.skintable.charSkins[skinList[i-1]];
                } else {
                    skindata = db.skintable.charSkins[skinList[i]];
                }

                if(i == 0){
                    tabcontent.push($("<div class='tab-pane container active' id='opCG_0_tab'>"
                        +"<img class='chara-image' src='img/characters/"+skindata.portraitId+".png'>"
                        +"</div>"));
                } else {
                    tabcontent.push($("<div class='tab-pane container fade' id='opCG_"+i+"_tab'>"
                        +"<img class='chara-image' src='img/characters/"+skindata.portraitId+".png'>"
                        +"</div>"));
                }

                var elitehtml = getEliteHTML(i,opdataFull);
                tabcontent2.push(elitehtml);

                $("#elite-sidenav").html(tabbtn);
                $("#tabs-opCG").html(tabcontent);
                $("#elite-topnav").html(tabbtn2);
                $("#tabs-opData").html(tabcontent2);
            }

            $("#op-nameTL").html(eval("opdata.name_"+lang));
            $("#op-nameREG").html("["+eval("opdata.name_"+reg)+"]");

            var gender = query(db.gender,"sex_cn",opdata.sex);
            $("#op-gender").html(eval("gender.sex_"+lang));

            var position = query(db.tags,"tag_cn",opdataFull.position);
            $("#op-position").html(eval("position.tag_"+lang));

            var type = query(db.classes,"type_cn",opdata.type);
            $("#op-classImage").attr("src","img/classes/black/icon_profession_"+eval("type.type_"+lang).toLowerCase()+"_large.png")


            $("#op-rarity").html("");
            $("#op-rarity").attr("class","op-rarity-"+opdata.level)
            for (var i = 0; i < opdata.level; i++) {
                $("#op-rarity").append("<i class='fa fa-star'></i>");
            }

            var tags_html = [];
            $.each(opdataFull.tagList,function(_,v){
                var tag = query(db.tags,"tag_cn",v);
                if(tag){
                    var tagReg = eval('tag.tag_'+reg);
                    var tagTL = eval('tag.tag_'+lang);
                    tags_html.push("<li style=\"list-style-type:none; padding-bottom: 10px;\"><button readonly type=\"button\" class=\"btn btn-sm ak-shadow-small ak-btn btn-secondary btn-char my-1\" data-toggle=\"tooltip\" data-placement=\"top\" title=\""+ tagReg +"\">" +
                            (tagReg == tagTL ? "" : '<a class="ak-subtitle2" style="font-size:11px;margin-left:-9px;margin-bottom:-15px">'+tagReg+'</a>') +tagTL + "</button></li>");
                }
            });
            $("#op-taglist").append(tags_html);
        }
    }

    function getEliteHTML(i, opdataFull){
        var container = $("<div class='tab-pane container "+(i!=0 ? 'fade' : 'active')+"' id='elite_"+i+"_tab'></div>");

        var stats = $("<div class='small-container ak-shadow'>"
                        +   "<p>Base</p>"
                        +   "<span>Stats</span>"
                        +   "<div class='topright maxlevel'>"
                        +       "<span class='maxleveltext'>Max Level</span>"
                        +       "<span class='leveltext'>"+opdataFull.phases[i].maxLevel+"</span>"
                        +       "<div class='ring'>"
                        +           "<div class='back ak-shadow'></div>"
                        +           "<div class='back-centre'></div>"
                        +       "</div></div></div>");

        if(i > 0){
            var mats = $("<div class='small-container ak-shadow'>"
                        +   "<p>Elite "+i+"</p>"
                        +   "<span>Required materials</span>"
                        +   "<img class='topright' src='img/ui/elite/"+i+".png' width='100'>"
                        +   "<button class='btn btn-default btn-collapsible' data-toggle='collapse' data-target='#elite"+i+"collapsible'><i class='fa fa-sort-down'></i></button>"
                        +   "<div id='elite"+i+"collapsible' class='collapse'>"
                        +       "Lorem ipsum dolor text...."
                        +   "</div></div>");
        } else {
            var mats = $("");
        }
        container.append(stats);
        container.append(mats);
        return container;
    }

    function query(db,key,val,single=true,returnKey=false){
        if(single){
            var result = {};
        } else {
            var result = [];
        }
        var found = false;
        $.each(db,function(key2,v){
            if(eval('v.'+key).toLowerCase() == val.toLowerCase()){
                found = true;
                if(single){
                    if(returnKey){
                        result[key2] = v;
                    } else {
                        result = v;
                    }
                    return false;
                } else {
                    if(returnKey){
                        var obj = {};
                        obj[key2] = v; 
                        result.push(obj);
                    } else {
                        result.push(v);
                    }
                }
            }
        });
        if(found){
            return result;
        } else {
            return false;
        }
    }

    function changeUILanguage(){
        reg = localStorage.gameRegion;
        lang = localStorage.webLang;

        $('#display-reg').text(reg.toUpperCase())
        
        switch (lang) {
            case "en":$('#display-lang').text("English");break;
            case "cn":$('#display-lang').text("Chinese");break;
            case "jp":$('#display-lang').text("Japanese");break;
        }
        
        localStorage.setItem("gameRegion", reg);
        localStorage.setItem("webLang", lang);
        getJSONdata("ui",function(data){
            if(data.length != 0){
                $.each(data, function(i,text){
                    $("[translate-id="+text.id).html(eval('text.ui_'+lang));
                });
            }
        });
    }

    function getJSONdata(type, callback){
        var x = 0;
        var req = $.getJSON("json/tl-"+type+".json");
        req.done(function(response){
            callback(response);
        });
        req.fail(function(response){
            console.log("type: "+type+" fail: ");
            console.log(response);
        });
    }

    function getUrlVars() {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            vars[key] = value;
        });
        return vars;
    }