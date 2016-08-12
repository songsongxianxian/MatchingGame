/*
* @Author: Shgga
* @Date:   2016-06-22 11:13:35
* @Last Modified by:   Shgga
* @Last Modified time: 2016-07-09 20:04:59
*/

!(function(angular){

	var myApp = angular.module('myApp', ['Game.service']);
	myApp.controller('indexController',['$scope','myService',function($scope,myService){
		//全局定时器
		var timer

		//获得最佳战绩
		getBest()
		
		$scope.user = ""
		$scope.time = '00:00'
		$scope.isPaused = true
		$scope.registing = false

		//初始化游戏参数-卡牌
		var cardDataObj = myService.CardData.init()

		//渲染函数,传入card数据对象
		myService.CardData.render(cardDataObj)

		////用户名校验,开始游戏
		if($scope.user){
			play()
		}else{
			alert("请点击【用户】输入用户名")
		}

		//点击“用户”时，显示form表单隐藏span
		$scope.register = function(){
			$scope.registing = true
		}
		//触发提交时，显示span,隐藏form表单
		$scope.logIn = function(){
			$scope.registing = false
			////用户名校验,开始游戏
			if($scope.user){
				play()
			}else{
				alert("请点击【用户】输入用户名")
			}
		}

		//点击暂停
		$scope.gamePause = function(){
			$scope.isPaused = true
			pause()
		}
		//点击继续
		$scope.gamePlay = function(){
			//用户名校验
			if(!$scope.user) {
				alert("请点击【用户】输入用户名")
				return
			}
			$scope.isPaused = false
			//开个定时器
			timer = setInterval(function(){
				time++
				if(time>3599) pause()
				//将用时渲染到页面
				$scope.time = myService.convert(time)
				$scope.$apply()
			},1000)
			play()
		}
		//重新开始
		$scope.newGame = function(){
			//重置数据
			$('.wrap').remove()
			clearInterval(timer)
			time = 0
			//重新获取最佳成绩，渲染到页面
			getBest()
			$scope.time = '00:00'
			$scope.isPaused = true

			//获取数据库中的用户和最佳战绩

			//初始化卡牌数据
			cardDataObj = myService.CardData.init()

			//渲染卡牌
			myService.CardData.render(cardDataObj)

			//用户名校验
			if(!$scope.user) {
				alert("请点击【用户】输入用户名")
				return
			}
			//开始游戏
			play()
		}

		//从Indexdb中获得最好成绩，并渲染到页面
		function getBest(){
			var promise = myService.getAllData()
			promise.then(function(data){
				var best
				best = data[0]?data[0].score:0
				console.log(best)
				for(var i = 0,len = data.length; i<len; i++){
					var item = data[i]
					if(item.score<best){
						best = item.score
					}
				}
				return best
			}).then(function(data){
				$scope.best = myService.convert(data)
			})
		}


		//游戏开始函数
		function play(){
			$('.card').on('click',function(){
				if($scope.isPaused){
					$scope.isPaused = false
					$scope.$apply()

					timer = setInterval(function(){
						time++
						if(time>3599) pause()
						//将用时渲染到页面
						$scope.time = myService.convert(time)
						$scope.$apply()
					},1000)
				}

				//节流阀,500毫秒只能点一次
				if(myService.tap) return

				;myService.soundActive.currentTime = 0
				myService.soundActive.play()

				//翻牌
				$(this).addClass('flipped')

				//如果翻第二张牌,进行匹配检查
				if($('.flipped').length==2){
					setTimeout(function(){
						if(myService.CardData.isMatch()){
							//隐藏匹配元素
							$('.flipped').removeClass('flipped').addClass('removed')

							//计分
							$scope.score += 100
							$scope.$apply()

							//卡牌全部消完时,游戏完成
							if($('.removed').length==cardDataObj.length){
								pause()
								//将数据存入数据库
								myService.upLoad($scope.user,time)
							}
						}
						else{
							$('.flipped').removeClass('flipped')
						}
					}, 500)
				}

				//500毫秒后打开节流阀
				setTimeout(function(){
					myService.tap = false
				}, 500)
				//关闭节流阀
				myService.tap = true
			})
		}
		//游戏暂停函数
		function pause(){
			$scope.isPaused = true
			clearInterval(timer)
			$('.card').off()
		}

	}])

})(angular)