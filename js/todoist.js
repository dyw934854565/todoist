	var Todoist = function(itemList,taskList,dateList){
		this.itemList = document.getElementById(itemList);
		this.taskList = document.getElementById(taskList);
		this.dateList = document.getElementById(dateList);
		this.bindEvents();
	};
    function hasClass(obj, cls) {
        return  obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
    }

    function addClass(obj, cls) {
        if (!this.hasClass(obj, cls)) obj.className += " " + cls;
    }

    function removeClass(obj, cls) {
        if (hasClass(obj, cls)) {
            var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
            obj.className = obj.className.replace(reg, ' ');
        }
    }
    function toggleClass(obj,cls){  
    	if(hasClass(obj,cls)){  
        	removeClass(obj, cls);  
    	}else{  
        	addClass(obj, cls);  
    	}  
	}
	function del_ff(elem){
		var elem_child = elem.childNodes;
		for(var i=0; i<elem_child.length;i++){
			if(elem_child[i].nodeName == "#text" && !/\s/.test(elem_child.nodeValue)){
				elem.removeChild(elem_child[i])
			}
		}
		return elem_child;
	}
	Todoist.prototype = {
		setActive: function(node){
			var childs = del_ff(this.itemList);
			for(var i=0; i<childs.length; i++){
				removeClass(childs[i], "active");
			}
			childs = del_ff(this.dateList);
			for(var i=0; i<childs.length; i++){
			 	removeClass(childs[i], "active")
			}
			addClass(node, "active");
			alert("加载"+node.getAttribute("item"))
		},
		bindEvents: function(){
			itemList.onclick = (function(self){
				return function(evt){
					var target = evt.target;
					if(target.tagName.toLowerCase() === 'span'){
						self.setActive(target.parentNode);
					}else if(target.tagName.toLowerCase() === 'del'){
						if(confirm("项目下的任务都会被删除")){
							self.delItem(target.parentNode);
						}
					}else{
						self.setActive(target);
					}
				}
			})(this);
			taskList.onclick = (function(self){
				return function(evt){
					var target = evt.target;
					if(target.tagName.toLowerCase() === 'span'){
						self.viewByItem(target.attributes['itemId'].nodeValue);
					}
					if(target.tagName.toLowerCase() === 'del'){
						if(confirm("项目下的任务都会被删除")){
							self.delItem(target.parentNode);
						}
					}
				}
			})(this);
			dateList.onclick = (function(self){
				return function(evt){
					var target = evt.target;
					if(target.tagName.toLowerCase() !== 'li'){
						target = target.parentNode;
					}
					self.setActive(target);
				}
			})(this);
		},
		ifleap: function(year){
			if(year%4==0){
				if(year%100==0){
					if(year%400==0){
						return true;
					}else{
						return false;
					}
				}else{
					return true;
				}
			}else{
				return false;
			}
		},
		getMonthDayCount: function(year, month){
			if(month == 2){
				return 28 + this.ifleap(year);
			}else if(month==1 || month==3 || month==5 || month==7 || month==8 || month==10 || month==12){
				return 31;
			}else{
				return 30;
			}
		},
		getDayCount: function(num){  //num天后的日期字符串
			var now = new Date();
			var year = now.getFullYear();
			var month = now.getMonth() + 1; //0  ---  11
			var day = now.getDate() + num;
			var daycount;
			while(day > (daycount = this.getMonthDayCount(year, month)) ){
				day -= daycount;
				if(++month > 12){
					++year;
					month = 1;
				}
			}
			return year + "-" + (month<10?'0'+month:month) + "-" + (day<10?'0'+day:day);
		},
		compareDate: function(date1,date2){  //返回date2-date1
			var day  = 0,
			fuhao = 1;
			if(date1>date2){
				fuhao = -1;
				var big = date1.split("-");
				var small = date2.split("-");
			}else{
				var big = date2.split("-");
				var small = date1.split("-");
			}
			
			for(var i=parseInt(small[0]); i<parseInt(big[0]); i++){		
				day += 365 + this.ifleap(i);
			}
			for(i=1; i<parseInt(big[1],10); i++){
				day += this.getMonthDayCount(parseInt(big[0]),i);
			}
			for(i=1; i<parseInt(small[1],10); i++){
				day -= this.getMonthDayCount(parseInt(small[0]),i);
			}
			day += parseInt(big[2],10) - parseInt(small[2],10);
			return day * fuhao;
		},
		addTask: function(content, item, start, deadline){
			//
		},
		delTask: function(){

		},
		finishTask: function(){

		},
		addItem: function(itemName,itemId){
    		var ifHasActive = false;
    		var childs = del_ff(this.itemList);
    		for(var i=0; i<childs.length; i++){
    			if(hasClass(childs[i],"active")){
    				    		alert(i);
    				childs[i].insertAdjacentHTML('beforeBegin', "<li item='"+itemId+"'><span>" + itemName + "</span><del>删除</del></li>");
    				ifHasActive = true;
    				i++;
    			}
    		}
    		if(!ifHasActive){
    			var li = document.createElement('li');
				li.setAttribute("item",itemId);
    			li.innerHTML = "<span>" + itemName + '</span><del>删除</del>';
    			this.itemList.appendChild(li);
    		}
		},
		delItem: function(itemLi){
			itemLi.style.opacity = "0";
			var self = this;
			setTimeout(function(){
				if(hasClass(itemLi,"active")){
					self.setActive(document.getElementById("today"));
				}
				itemList.removeChild(itemLi);
			},500);
		},
		viewByItem: function(itemId){

		},
		viewByStartTime: function(){

		},
		viewByDeadline: function(){

		},
		viewByOverdue: function(){

		}
	};