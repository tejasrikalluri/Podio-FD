var base64 = require('base-64');
var baseUrl = "https://api.podio.com";
exports = {
    createTask: function (options) {
        var decodeBody = options.body;
        try {
            var bodyData = JSON.parse(base64.decode(decodeBody));
            var url = baseUrl + "/task";
            var headers = {
                'Authorization': 'Bearer <%= access_token %>'
            };
            var option = {
                headers: headers,
                isOAuth: true,
                json: bodyData
            };
            $request.post(url, option).then(function () {
                renderData();
            }, function (error) {
                renderData(error, null);
            });
        } catch (error) {
            renderData(error, null);

        }

    },
    taskDetails: function (taskoptions) {
        var taskURL = baseUrl + '/task/' + taskoptions.id;
        var taskheaders = {
            'Authorization': 'Bearer <%= access_token %>'
        };
        var taskoption = {
            headers: taskheaders,
            isOAuth: true
        };
        $request.get(taskURL, taskoption).then(function (data) {
            var resObj = data.response;
            renderData(null, {
                body: resObj
            });
        }, function (err) {
            try {
                var desc = JSON.parse(err.response).error_description;
            } catch (error) {
                renderData(error, null);
            }
            renderData(null, desc);
        });

    },
    getContacts: function (contactoptions) {
        var orgId = base64.decode(contactoptions.orgId);
        var contactURL = baseUrl + '/contact/org/' + orgId + '?limit=500';
        var contactheaders = {
            'Authorization': 'Bearer <%= access_token %>'
        };
        var contactoption = {
            headers: contactheaders,
            isOAuth: true
        };
        $request.get(contactURL, contactoption).then(function (data) {
            try {
                var result = JSON.parse(data.response);
                var map = new Map;
                for (var i = 0; i < result.length; i++) {
                    map[result[i].name] = result[i].user_id;
                }
                renderData(null, {
                    body: map
                });
            } catch (error) {
                renderData(error, null);
            }

        }, function (err) {
            renderData(err, null);
        });
    },
    fetchTasksToLink: function (getTaskoptions) {
        var spaceid = base64.decode(getTaskoptions.spaceId);
        var getTaskURL = baseUrl + '/task?space=' + spaceid;
        var getTaskheaders = {
            'Authorization': 'Bearer <%= access_token %>'
        };
        var getTaskoption = {
            headers: getTaskheaders,
            isOAuth: true
        };
        $request.get(getTaskURL, getTaskoption).then(function (data) {
            try {
                var resObj = JSON.parse(data.response);
                var map = new Map();
                for (var i = 0; i < resObj.length; i++) {
                    if (resObj[i].status === "active") {
                        map[resObj[i].text] = resObj[i].task_id;
                    }
                }
                renderData(null, {
                    body: map
                });
            } catch (error) {
                renderData(error, null);
            }

        }, function (err) {
            renderData(err, null);
        });
    }
};