	var Todoist = function(itemList,taskList,dateList){
		this.itemList = document.getElementById(itemList);
		this.taskList = document.getElementById(taskList);
		this.dateList = document.getElementById(dateList);
		this.todoist_item = storedb("todoist_item");
    	this.todoist_task = storedb("todoist_task");
    	//alert(localStorage.getItem("todoist_task"));
    	this.loadItem();
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
				elem.removeChild(elem_child[i]);
			}
		}
		return elem_child;
	}
	Todoist.prototype = {
		getTodayStr: function(){
			var date = new Date();
			var year = "" +　date.getFullYear();
			var month = date.getMonth() + 1;
			month = month>9?"":"0" + month;
			var day = date.getDate();
			day = day>9?"":"0" + day;
			return year + "-" + month + "-" + day;
		},
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
			if(node.getAttribute("itemname")){
				this.viewByItemName(node.getAttribute("itemname"));
			}else{
				this.viewByItem(node.getAttribute("item"));
			}
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
					}else if(target.tagName.toLowerCase() === 'ul'){
					}else{
						self.setActive(target);
					}
				}
			})(this);
			taskList.onchange = (function(self){
				return function(evt){
					var target = evt.target;
					if(target.type.toLowerCase() === 'checkbox'){
						if(confirm("是否已完成任务？")){
							target.disabled = true;
							self.finishTask(self.getParent(target, 'li').getAttribute("taskid"));
							if(itemname.innerHTML == "todoist"){
								self.setTaskCount(-1,self.getParent(target,'li').firstChild.innerHTML);
							}else{
								self.loadTask(itemname.innerHTML);
								self.setTaskCount(-1);
							}
						}else{
							target.checked = false;
					    }
					}
					if(target.type.toLowerCase() === 'text'){
						self.todoist_task.update({"_id":self.getParent(target, 'li').getAttribute("taskid")},{"$set":{"content":target.value}});
					}
				}
			})(this);
			dateList.onclick = (function(self){
				return function(evt){
					var target = evt.target;
					if(target.tagName.toLowerCase() === 'ul'){
						
					}else{
					 	if(target.tagName.toLowerCase() !== 'li'){
							target = target.parentNode;
						}
						self.setActive(target);
					}
					
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
		getDayCount: function(num,date){  //date的num天后的日期字符串
			if(typeof date == "undefined"){
				var now = new Date();
				var year = now.getFullYear();
				var month = now.getMonth() + 1; //0  ---  11
				var day = now.getDate() + num;
			}else{
				var now = date.split("-");
				var year = parseInt(now[0]);
				var month = parseInt(now[1]);
				var day = parseInt(now[2]) + num;
			}
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
		addTask: function(content, start, deadline){
			var self = this;
			this.todoist_task.insert({"item":itemname.innerHTML,"content":content,"start":start,"end":deadline});
			this.loadTask(itemname.innerHTML);
			var childs = del_ff(this.itemList);
			this.setTaskCount(1);
		},
		loadTask: function(itemName){
			var self = this;
			this.taskList.innerHTML = ""; //先清空
			var tasks = this.todoist_task.find({"item":itemName});
			tasks.sort(function(a, b){
				if(b["finished"] === a["finished"]){
					return self.compareDate(b["end"], a["end"]);
				}else if(b["finished"] === "yes"){
					return -1;
				}else{
					return 1;
				}
			});
			for(var i=0; i<tasks.length; i++){
				this.taskList.appendChild(self.createTaskLi(tasks[i]["content"], tasks[i]["start"], tasks[i]["end"],null, tasks[i]["_id"], tasks[i]["finished"]));
			}
		},
		delTask: function(){
			var childs = del_ff(this.taskList);
			var count = 0;
			for(var i=childs.length-1; i>=0; i--){
				if(childs[i].firstChild.checked){
					this.todoist_task.remove({"_id":childs[i].getAttribute("taskid")});
					this.taskList.removeChild(childs[i]);
					count++;
				}
			}
			// if(count>0){
			// 	this.setTaskCount(0-count);
			// }
		},
		setTaskCount:function(num,item){
			var childs = del_ff(this.itemList);
			for(var i=childs.length-1; i>=0; i--){
				if(typeof item == "undefined"){
					if(hasClass(childs[i],'active')){
						var ele = childs[i].childNodes[1];
						break;
					}
				}else{
					if(childs[i].getAttribute("itemname") == item){
						var ele = childs[i].childNodes[1];
						break;
					}
				}
			}
			var now = 0;
			if(ele.innerHTML !== ""){
				now = parseInt(ele.innerHTML);
			}
			var temp = now + num;
			if(temp>0){
				ele.innerHTML = temp;
			}else{
				ele.innerHTML = "";
			}
		},
		finishTask: function(id){
			this.todoist_task.update({"_id":id},{"$set":{"finished":"yes"}});
		},
		addItem: function(itemName, priority){
			if(this.todoist_item.find({"name":itemName}).length>0){
				return false;
			}
			this.todoist_item.insert({"name":itemName,"priority":priority});
    		var ifHasActive = false;
    		var childs = del_ff(this.itemList);
    		for(var i=0; i<childs.length; i++){
    			if(hasClass(childs[i],"active")){
    				childs[i].insertAdjacentHTML('beforeBegin', "<li itemname='"+itemName+"'><span class='itemname'>" + itemName + "</span><span class='taskcount'></span><del>删除</del></li>");
    				ifHasActive = true;
    				i++;  //会改变当前元素的索引
    			}
    		}
    		if(!ifHasActive){
    			var li = document.createElement('li');
				li.setAttribute("itemname",itemName);
    			li.innerHTML = "<span class='itemname'>" + itemName + "</span><span class='taskcount'></span><del>删除</del>";
    			this.itemList.appendChild(li);
    		}
    		childs = del_ff(this.itemList);
    		for(var i=0; i<childs.length; i++){
    			this.todoist_item.update({"name":childs[i].getAttribute("itemname")},{"$set":{"priority":i+1}});
    		}
    		return true;
		},
		delItem: function(itemLi){
			this.todoist_item.remove({"name":itemLi.getAttribute('itemname')});
			this.todoist_task.remove({"item":itemLi.getAttribute('itemname')});
			itemLi.style.opacity = "0";
			var self = this;
			setTimeout(function(){
				self.setActive(document.getElementById("today"));
				itemList.removeChild(itemLi);
			},500);
		},
		loadItem: function(){
    		if(localStorage.getItem("todoist_item")){
    			var items = this.todoist_item.find();
    			items.sort(function(a,b){
    				return a["priority"] - b["priority"];
    			});
				for(var i=0; i<items.length; i++){
					var li = document.createElement('li');
					li.setAttribute("itemname",items[i]["name"]);
					var count = this.todoist_task.find({"item":items[i]["name"],"finished":null}).length;
					if(!count){
						count = "";
					}
    				li.innerHTML = "<span class='itemname'>" + items[i]["name"] + "</span><span class='taskcount'>"+count+"</span><del>删除</del>";
    				this.itemList.appendChild(li);
				}
    		}else{
    			this.addItem("个人",1);
    			this.addItem("工作",1);
    			this.addItem("杂项",2);
    			this.addItem("购物",2);
    			this.addItem("要看的电影",3);
    		}
		},
		viewByItem: function(item){  //系统项目
			if(item == "todoist"){
				taskAddBar.style.display = "none";
				itemname.innerHTML = "todoist";
			}
			this.taskList.innerHTML = "";
			delTaskBtn.style.display = "none";
			this.viewByDeadline();
			this.viewByOverdue();
		},
		viewByItemName: function(item){  //用户项目
			taskAddBar.style.display = "block";
			delTaskBtn.style.display = "block";
			itemname.innerHTML = item;
			this.loadTask(item);
		},
		viewByDeadline: function(){
			var self = this;
			for(var i=0; i<7; i++){
				var tasks = self.todoist_task.find({"end":self.getDayCount(i)});
				if(tasks.length>0){
					var li = document.createElement("li");
					li.className = "divide";
					if(i){
						li.innerHTML = i + "天后完成";
					}else{
						li.innerHTML = "今天完成";
					}
					taskList.appendChild(li);
					tasks.sort(function(a,b){
						if(b["finished"] === a["finished"]){
							var res = self.todoist_item.find({"name":a["item"]})[0]["priority"] - self.todoist_item.find({"name":b["item"]})[0]["priority"];
							if(res === 0){
								return self.compareDate(b["end"],a["end"]);
							}else{
								return res;
							}
						}else if(b["finished"] === "yes"){
							return -1;
						}else{
							return 1;
						}
					});
					for(var j=0; j<tasks.length; j++){
						this.taskList.appendChild(self.createTaskLi(tasks[j]["content"], tasks[j]["start"], tasks[j]["end"], tasks[j]["item"], tasks[j]["_id"], tasks[j]["finished"]));
					}
				}
			}
		},
		createTaskLi: function(content, start, deadline, itemName, id, finished){
			var li = document.createElement("li");
			li.setAttribute("taskid",id)
			start = todoist.compareDate(todoist.getTodayStr(), start);
			if(start){
				start = Math.abs(start).toString() + (start>0?"天后":"天前" + "开始");
			}else{
				start = "今天开始";
			}
			deadline = todoist.compareDate(todoist.getTodayStr(), deadline);
			if(deadline){
				deadline = Math.abs(deadline).toString() + (deadline>0?"天后完成":"天前就应该完成了");
			}else{
				deadline = "今天结束";
			}
			if(itemName){
				itemName = "<span>"+itemName+"</span>" + "&nbsp; 项目下：";
			}else{
				itemName = "";
			}
			var finish = "";
			if(finished === "yes"){
				finish = " checked disabled";
			}
			li.innerHTML =itemName + "<input" + finish + " type='checkbox'><strong><input type='text' value='" + content + "'/>" + "<span>" + start + "</span>" + "<span>" + deadline + "</span></strong>";
			return li;
		},
		getParent: function(ele, tag){
			while(ele.parentNode.nodeName.toLowerCase() !== tag){
				ele = ele.parentNode;
			}
			return ele.parentNode;
		},
		viewByOverdue: function(){
			var self = this;
			var li = document.createElement("li");
			li.className = "divide";
			var tasks = this.todoist_task.find();
			li.innerHTML = "过期未完成任务";
			var ifhave = false;
			for (var j = tasks.length - 1; j >= 0; j--) {
				if(self.compareDate(self.getTodayStr(),tasks[j]["end"])<0 && tasks[j]["finished"]!=="yes"){
					if(!ifhave){
						this.taskList.appendChild(li);
						ifhave = true;
					}
					this.taskList.appendChild(self.createTaskLi(tasks[j]["content"], tasks[j]["start"], tasks[j]["end"], tasks[j]["item"], tasks[j]["_id"], tasks[j]["finished"]));
				}
			};
			if(!ifhave){
				li.innerHTML = "没有过期任务，继续加油";
				this.taskList.appendChild(li);
			}
		}
	};