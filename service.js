/*
* @Author: Shgga
* @Date:   2016-06-22 11:13:35
* @Last Modified by:   Shgga
* @Last Modified time: 2016-07-09 20:04:59
*/

!(function(angular){
	var app = angular.module('Game.service',['indexDB'])
	app.service('myService',['IndexDB','$q',function(IndexDB,$q){

		//节流变量
		this.tap = false
		//游戏对象
		this.CardData = CardData
		//声音相关
		this.soundActive = document.getElementById('soundActive')
		this.soundActive.volume = .4
		//工具函数
		this.convert = function (time){
			var seconds = (time%60)>9?(''+(time%60)):('0'+(time%60))
			var minutes = parseInt(time/60)>9?(''+parseInt(time/60)):('0'+parseInt(time/60))
			return  (minutes+':'+seconds)
		}

		//更新数据
		this.upLoad = function(user,time){
			var data = {
				username:user,
				score:time
			}
			IndexDB.update('user',data)
		}

		//获得最佳战绩
		this.getAllData = function(){
			var deferred = $q.defer();
			IndexDB.getAll('user',function(data){
				deferred.resolve(data)
			},function(e){
				deferred.reject(e)
			})
			return deferred.promise
		}

		var cards = $('#cards')
		//定义花色
		var color = ['hei','tao','hua','hong']
		//定义面值对象
		var value = ['1','2','3','4','5','6','7','8','9','10','J','Q','K']
		//随机下标函数
		function randomIndex(max){
			return window.Math.floor(window.Math.random()*max)
		}

		//card数据构造函数
		function CardData(){
			var valueIndex = randomIndex(13)
			var colorIndex = randomIndex(4)
			//拼接字符串生成ID
			var id = color[colorIndex]+value[valueIndex]

			this.value = value[valueIndex]
			this.color = color[colorIndex]
			this.id = id

			this.bgPositionX = -2.5*valueIndex
			this.bgPositionY = -3.75*colorIndex
		}

		//卡牌数据初始化函数
		CardData.init = function(){
			time = 0
			var row = 4,col = 5

			//定义卡牌数据对象,存储卡牌数据
			var cardDataObj = []
			var cardDataObjClone = []

			for(var i = 0; i<(col*row)/2; i++){
				var temp = new CardData
				cardDataObj.push(temp)
				cardDataObjClone.push(temp)
			}
			//将两个数组合并生成card对象数组,然后随机排序
			cardDataObj.push.apply(cardDataObj,cardDataObjClone)
			cardDataObj.sort(function(){
				return 0.5 - window.Math.random()
			});
			//返回生成的card数据对象
			return cardDataObj
		}

		//卡牌数据渲染函数,根据card数据生成元素,将元素渲染到页面
		CardData.render = function(cardDataObj){
			$.each(cardDataObj,function(index,item){
			//创建.wrap元素
			var tempElement= document.createElement('div')
			$(tempElement).addClass('wrap').html(
				'<div class="card">'+
					'<div class="face front"></div>'+
					'<div class="face back"></div>'+
				'</div>'
			)

			//选到.back的DOM元素
			var frontEle = tempElement.children[0].children[1]
			//设置背景定位属性
			$(frontEle).css('background-position',item.bgPositionX+'rem'+' '+item.bgPositionY+'rem')
			//给card添加pattern的自定义属性
			$(tempElement).children('.card').attr('cardID', item.id)
			//将生成的元素添加到父元素cards中S
			cards.append(tempElement)
			})
		}

		//匹配函数,对比两个元素的自定义属性的值.
		CardData.isMatch = function(){
			var flippedCards = $('.flipped');
			var card0 = $(flippedCards[0]).attr('cardID');
			var card1 = $(flippedCards[1]).attr('cardID');
			return (card0 == card1);
		}

	}])

})(angular)