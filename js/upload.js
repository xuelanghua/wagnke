//调用图片上传
function imageUpload(cb) {
	if (mui.os.plus) {
		var buttonTitle = [{
			title: "拍照",
			style: 'default'
		}, {
			title: "从手机相册选择",
			style: 'default'
		}];

		plus.nativeUI.actionSheet({
			// title: "上传图片",
			cancel: "取消",
			buttons: buttonTitle
		}, function(b) { /*actionSheet 按钮点击事件*/
			switch (b.index) {
				case 0:
					break;
				case 1:
					getImg(cb); /*拍照*/
					break;
				case 2:
					galleryImg(cb); /*打开相册*/
					break;
				default:
					break;
			}
		})
	}
}

// 拍照获取图片
function getImg(cb) {
	var camera = plus.camera.getCamera();
	camera.captureImage(function(e) {
		plus.io.resolveLocalFileSystemURL(e, function(entry) {
			imageResize(entry.toLocalURL(), cb);
			// 其他操作,比如预览展示
		}, function(e) {
			console.log("读取拍照文件错误：" + e.message);
		});
	}, function(s) {
		console.log("error" + s);
	}, {
		filename: "_doc/camera/"
	})
}

// 从相册中选择图片 
function galleryImg(cb) {
	// 从相册中选择图片
	plus.gallery.pick(function(e) {
		imageResize(e, cb);
		// 		    	for(var i in e.files){
		// 			    	var fileSrc = e.files[i];
		// 		    	}
	}, function(e) {
		console.log("取消选择图片");
	}, {
		filter: "image",
		multiple: false,
		maximum: 5,
		system: false,
		onmaxed: function() {
			plus.nativeUI.alert('最多只能选择1张图片');
		}
	});
}
// 上传的方法
function upload(file, cb) {
	// var waiting = plus.nativeUI.showWaiting('图片上传中...');
	showload(false, false, '图片上传中...', "rgba(0,0,0,0.5)");
	var task = plus.uploader.createUpload($uploadUrl, {
			method: "POST",
			blocksize: 614400,
			priority: 100
		},
		function(t, status) { //上传完成
			if (status == 200) {
				var res = JSON.parse(t.responseText);
				if (res.error) {
					// plus.nativeUI.alert(res.error.message, waiting.close(), '提示', 'OK');
					plus.nativeUI.alert(res.error.message, showload(1), '提示', 'OK');
				} else {
					logs(res);
					showload(1);
					cb(res);
					// waiting.close();
				}
			} else {
				console.log("上传失败：" + status);
				// plus.nativeUI.alert('上传失败!', waiting.close(), '提示', 'OK');
				plus.nativeUI.alert('上传失败!', showload(1), '提示', 'OK');
			}
		}
	);
	// 页面中要上传的 图片路径
	task.addFile(file, {
		key: 'file'
	});
	task.start();
	setTimeout(function() {
		showload(1);
	}, 10000);
}

//压缩（需要获取本地文件权限）  
function imageResize(src, cb) {
	var filename = src.substring(src.lastIndexOf('/') + 1);
	var direction = 0;
	plus.io.getImageInfo({
		src: src,
		success: function(res) {
			var orientation = res.orientation;
			if (orientation == 'right') {
				direction = 90;
			} else if (orientation == 'left') {
				direction = 270;
			} else if (orientation == 'down') {
				direction = 180;
			}
			plus.zip.compressImage({
				src: src,
				dst: '_doc/' + filename,
				overwrite: true,
				// width: '1024px', //这里指定了宽度，同样可以修改  
				format: 'jpg',
				quality: 100, //图片质量不再修改，以免失真  
				rotate: direction
			}, function(e) {
				upload(e.target, cb);
			}, function(err) {
				plus.nativeUI.alert('处理出错!', '', '提示', 'OK');
			})
		},
		fail: function(error) {
			plus.nativeUI.alert(error.message, '', '提示', 'OK');
		}
	});
}

//视频上传
function videoUpload(cb) {
	plus.gallery.pick(function(e) {
		var file = e;
		plus.io.getVideoInfo({
			filePath: file,
			success: function(res) {
				if (res.size < $videoMaxSize) {
					showload(false, false, '视频上传中...', "rgba(0,0,0,0.5)");
					var task = plus.uploader.createUpload($videoUrl, {
							method: "POST",
							blocksize: 614400,
							priority: 100
						},
						function(t, status) { //上传完成
							if (status == 200) {
								var res = JSON.parse(t.responseText);
								if (res.error) {
									plus.nativeUI.alert(res.error.message, showload(1), '提示', 'OK');
								} else {
									showload(1);
									cb(res);
								}
							} else {
								console.log("上传失败：" + status);
								plus.nativeUI.alert('上传失败!', showload(1), '提示', 'OK');
							}
						}
					);
					// 页面中要上传的 图片路径
					task.addFile(file, {
						key: 'file'
					});
					task.start();
					setTimeout(function() {
						showload(1);
					}, 10000);
				} else {
					plus.nativeUI.alert('选择视频文件过大!', '', '提示', 'OK');
				}
			},
			fail: function(error) {
				plus.nativeUI.alert(error.message, '', '提示', 'OK');
			}
		});
	}, function(e) {
		console.log("取消选择视频");
	}, {
		filter: "video",
		multiple: false,
		maximum: 5,
		system: false,
		onmaxed: function() {
			plus.nativeUI.alert('最多只能选择1个视频');
		}
	});
}
