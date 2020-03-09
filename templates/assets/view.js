CTFd._internal.challenge.data = undefined

CTFd._internal.challenge.renderer = CTFd.lib.markdown();

CTFd._internal.challenge.preRender = function() {}

CTFd._internal.challenge.render = function(markdown) {
    return CTFd._internal.challenge.renderer.render(markdown)
}

CTFd._internal.challenge.postRender = function() { loadInfo(); }

if ($ === undefined) $ = CTFd.lib.$;
function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}
function loadInfo() {
    var challenge_id = parseInt($('#challenge-id').val());
    var url = "/plugins/ctfd-whale/container?challenge_id=" + challenge_id;

    var params = {};

    CTFd.fetch(url, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(function(response) {
        if (response.status === 429) {
            // User was ratelimited but process response
            return response.json();
        }
        if (response.status === 403) {
            // User is not logged in or CTF is paused.
    return response.json();
}
return response.json();
}).then(function(response) {
if (response.remaining_time === undefined) {
    $('#whale-panel').html('<div class="card" style="width: 100%;">' +
	'<div class="card-body">' +
	'<h5 class="card-title">靶机信息</h5>' +
	'<button type="button" class="btn btn-primary card-link" id="whale-button-boot" onclick="CTFd._internal.challenge.boot()">启动环境</button>' +
	'</div>' +
	'</div>');
} else {
	var left_time_s = response.remaining_time
	var h = Math.floor(left_time_s / 3600);
	var m = Math.floor((left_time_s / 60 % 60));
	var s = Math.floor((left_time_s % 60));
    if (response.type === 'http') {
	$('#whale-panel').html('<div class="card" style="width: 100%;">' +
	    '<div class="card-body">' +
	    '<h5 class="card-title">靶机信息</h5>' +
	    '<h6 class="card-subtitle mb-2 text-muted" id="whale-challenge-count-down">环境剩余时间: ' + h + '时'+m+'分'+s+'秒</h6>' +
	    '<p class="card-text">http://' + response.domain + '</p>' +
	    '<button type="button" class="btn btn-danger card-link" id="whale-button-destroy" onclick="CTFd._internal.challenge.destroy()">关闭环境</button>' +
	    '<button type="button" class="btn btn-success card-link" id="whale-button-renew" onclick="CTFd._internal.challenge.renew()">刷新环境</button>' +
	    '</div>' +
	    '</div>');
    } else {
	$('#whale-panel').html('<div class="card" style="width: 100%;">' +
            '<div class="card-body">' +
            '<h5 class="card-title">靶机信息</h5>' +
            '<h6 class="card-subtitle mb-2 text-muted" id="startup_left_second">正在在启动，请稍后...+'+startup_left_second+'s</h6>' +
            '</div>' +
            '</div>');
	
	sleep(30000).then(()=>{
	$('#whale-panel').html('<div class="card" style="width: 100%;">' +
	    '<div class="card-body">' +
	    '<h5 class="card-title">靶机信息</h5>' +
	    '<h6 class="card-subtitle mb-2 text-muted" id="whale-challenge-count-down">环境剩余时间: ' + h + '时'+m+'分'+s+'秒</h6>' +
	    '<p class="card-text"><a href=http://' + response.ip + ':' + response.port + ' target="view_window">http://'+response.ip+':'+response.port +'</a></p>' +
	    '<button type="button" class="btn btn-danger card-link" id="whale-button-destroy" onclick="CTFd._internal.challenge.destroy()">关闭环境</button>' +
	    '<button type="button" class="btn btn-success card-link" id="whale-button-renew" onclick="CTFd._internal.challenge.renew()">刷新环境</button>' +
	    '</div>' +
	    '</div>');

	})
    }

            if (window.t !== undefined) {
            	clearInterval(window.t);
                window.t = undefined;
            }

            function showAuto() {
                const c = $('#whale-challenge-count-down')[0];
                if (c === undefined) return;
		left_time_s--;
              	var h = Math.floor(left_time_s / 3600);
                var m = Math.floor((left_time_s / 60 % 60));
                var s = Math.floor((left_time_s % 60));
                c.innerHTML = '环境剩余时间: ' + h + '时'+m+'分'+s+'秒';
                if (left_time_s < 0) {
                    loadInfo();
                }
            }

            window.t = setInterval(showAuto, 1000);
        }
    });
};

CTFd._internal.challenge.destroy = function() {
    var challenge_id = parseInt($('#challenge-id').val());
    var url = "/plugins/ctfd-whale/container?challenge_id=" + challenge_id;

    $('#whale-button-destroy')[0].innerHTML = "Waiting...";
    $('#whale-button-destroy')[0].disabled = true;

    var params = {};

    CTFd.fetch(url, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    }).then(function(response) {
        if (response.status === 429) {
            // User was ratelimited but process response
            return response.json();
        }
        if (response.status === 403) {
            // User is not logged in or CTF is paused.
            return response.json();
        }
        return response.json();
    }).then(function(response) {
        if (response.success) {
            loadInfo();
            CTFd.ui.ezq.ezAlert({
                title: "成功",
                body: "环境已关闭!",
                button: "OK"
            });
        } else {
            $('#whale-button-destroy')[0].innerHTML = "关闭环境";
            $('#whale-button-destroy')[0].disabled = false;
            CTFd.ui.ezq.ezAlert({
                title: "Fail",
                body: response.msg,
                button: "OK"
            });
        }
    });
};

CTFd._internal.challenge.renew = function() {
    var challenge_id = parseInt($('#challenge-id').val());
    var url = "/plugins/ctfd-whale/container?challenge_id=" + challenge_id;

    $('#whale-button-renew')[0].innerHTML = "Waiting...";
    $('#whale-button-renew')[0].disabled = true;

    var params = {};

    CTFd.fetch(url, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    }).then(function(response) {
        if (response.status === 429) {
            // User was ratelimited but process response
            return response.json();
        }
        if (response.status === 403) {
            // User is not logged in or CTF is paused.
            return response.json();
        }
        return response.json();
    }).then(function(response) {
        if (response.success) {
            loadInfo();
            CTFd.ui.ezq.ezAlert({
                title: "成功",
                body: "环境已刷新!",
                button: "OK"
            });
        } else {
            $('#whale-button-renew')[0].innerHTML = "刷新环境";
            $('#whale-button-renew')[0].disabled = false;
            CTFd.ui.ezq.ezAlert({
                title: "Fail",
                body: response.msg,
                button: "OK"
            });
        }
    });
};

CTFd._internal.challenge.boot = function() {
    var challenge_id = parseInt($('#challenge-id').val());
    var url = "/plugins/ctfd-whale/container?challenge_id=" + challenge_id;

    $('#whale-button-boot')[0].innerHTML = "Waiting...";
    $('#whale-button-boot')[0].disabled = true;

    var params = {};

    CTFd.fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    }).then(function(response) {
        if (response.status === 429) {
            // User was ratelimited but process response
            return response.json();
        }
        if (response.status === 403) {
            // User is not logged in or CTF is paused.
            return response.json();
        }
        return response.json();
    }).then(function(response) {
        if (response.success) {
            loadInfo();
            CTFd.ui.ezq.ezAlert({
                title: "成功",
                body: "环境已启动!",
                button: "OK"
            });
        } else {
            $('#whale-button-boot')[0].innerHTML = "启动环境";
            $('#whale-button-boot')[0].disabled = false;
            CTFd.ui.ezq.ezAlert({
                title: "Fail",
                body: response.msg,
                button: "OK"
            });
        }
    });
};


CTFd._internal.challenge.submit = function(preview) {
    var challenge_id = parseInt($('#challenge-id').val())
    var submission = $('#submission-input').val()

    var body = {
        'challenge_id': challenge_id,
        'submission': submission,
    }
    var params = {}
    if (preview)
        params['preview'] = true

    return CTFd.api.post_challenge_attempt(params, body).then(function(response) {
        if (response.status === 429) {
            // User was ratelimited but process response
            return response
        }
        if (response.status === 403) {
            // User is not logged in or CTF is paused.
            return response
        }
        return response
    })
};
