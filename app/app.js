$(document).ready(function () {
    app.initialized().then(function (_client) {
        window.client = _client;
        client.events.on('app.activated', function () {
            $('#load_msg').show();
            $('#create_task, #link_task, #unlink_task, #detailsPage, #details, #errorMsg').hide();
            $(document).on('click', '#unlink_task', function () {
                client.interface.trigger("showConfirm", {
                    title: "Confirmation of Task Unlink",
                    message: "Are you sure you want to Unlink this Task?", saveLabel: "Unlink", cancelLabel: "Cancel"
                }).then(unlinkCondition).catch(handleError(error));
            });
            $('#create_task').click(function () {
                client.interface.trigger("showModal", {
                    title: "Create New Task in Podio",
                    template: "taskModel.html"
                });
            });
            $('#link_task').click(function () {
                client.interface.trigger("showModal", {
                    title: "Link Existing Podio Task",
                    template: "linkModel.html"
                });
            });
            client.instance.receive(function (data) {
                let successData = data.data.message.msg;
                if (successData === "success") {
                    getDB(client);
                } else {
                    $('#detailsPage, #details, #unlink_task, #load_msg').hide();
                    $('#create_task, #link_task').show();
                    resizeApp(client);
                }
            });
            ticketDetails(client, function (ticket_ID) {
                let ticketid = atob(ticket_ID);
                getCompleteDetailsOfTask(client, ticketid);
            });
        }, function (error) {
            handleError(error);
        }); // activated
    }, function (error) {
        handleError(error);
    }); // initialized
    var ticketDetails = function (client, callback) {
        client.data.get('ticket').then(function (tdata) {
            var ticketId = tdata.ticket.id;
            var t_id = btoa(ticketId);
            callback(t_id);
        }, function (error) {
            handleError(error);
        });
    }
    function unlinkCondition(result) {
        if (result.message == "Unlink") deleteDB(client);
    }
    var iparamsFunction = function (client, callback) {
        //Getting values from iParams
        client.iparams.get().then(function (iparamData) {
            let apiDomain = iparamData.fdAPIDomain;
            let customDomain = iparamData.fdCustomDomain;
            let selectedTaskArr = iparamData.selectedTask;
            let taskArray = [];
            taskArray["apiDomain"] = apiDomain;
            taskArray["customDomain"] = customDomain;
            taskArray["selectedTaskArr"] = selectedTaskArr;
            callback(taskArray);
        }, function (error) {
            handleError(error);
        });
    }

    function getCompleteDetailsOfTask(client, ticketid) {
        let ticketID = btoa(ticketid);
        client.db.get(ticketID).then(function () {
            getDB(client);
        }, function () {
            $('#detailsPage, #details, #unlink_task, #load_msg').hide();
            $('#create_task, #link_task').show();
            resizeApp(client);
        });
    }

    function deleteDB(client) {
        ticketDetails(client, function (ticket_ID) {
            client.db.delete(ticket_ID).then(function () {
                $('#detailsPage, #details, #unlink_task, #load_msg, #errorMsg').hide();
                $("#apptext").html("Task Unlinked Successfully").show();
                resizeApp(client);
                setTimeout(() => {
                    $("#apptext").hide();
                    $('#create_task, #link_task').show();
                    resizeApp(client);
                }, 3000);

            }, function (error) {
                handleError(error);
            });
        });
    }

    function getDB(client) {
        ticketDetails(client, function (ticketID) {
            //Getting values from Db
            let ticket_id = atob(ticketID);
            client.db.get(ticketID).then(function (data) {
                var taskId = data.task_id;
                var t_id = atob(taskId);
                invokeFunction(client, t_id, ticket_id);
            }, function (error) {
                if (error.status === 404) {
                    $('#detailsPage, #details, #load_msg').hide();
                    $('#link_task, #create_task').show();
                    resizeApp(client);
                } else {
                    handleError(error);
                }
            });
        }, function (error) {
            handleError(error);
        });
    }

    function invokeFunction(client, t_id, ticket_id) {
        var ticket_options = {
            "id": t_id
        };
        //Getting task details
        client.request.invoke("taskDetails", ticket_options).then(function (task_data) {
            if (task_data.response === "The task has been deleted") {
                $(" #load_msg").hide();
                $("#errorMsg").show().html("The task has been deleted from Podio.");
                resizeApp(client);
                setTimeout(function () {
                    deleteDB(client);
                }, 2000);
            } else {
                var t_res = JSON.parse(task_data.response.body);
                $("#link_task, #create_task, #load_msg").hide();
                $('#unlink_task, #detailsPage, #details').show();
                $('#details').html('<a class="m5r" title="View Task in Podio" href="' + t_res.link + '" target="_blank" rel="noreferrer"><i class="fa fa-external-link"></i></a>');
                appendTaskDetails(client, t_res, ticket_id);
            }
        }, function (error) {
            handleError(error);
        });
    }

    function appendTaskDetails(client, t_res, ticket_id) {
        iparamsFunction(client, function (taskArr) {
            let k = 0;
            var taskDetails = [];
            var taskArray = taskArr.selectedTaskArr;
            let apiDomain = taskArr.apiDomain;
            let customDomain = taskArr.customDomain;
            iterateOverAllTaskFields(client, taskDetails, taskArray, t_res, k, ticket_id, apiDomain, customDomain);
        }, function (error) {
            handleError(error);
        });
    }

    function iterateOverAllTaskFields(client, taskDetails, taskArray, t_res, k, ticket_id, apiDomain, customDomain) {
        if (taskArray[k] !== undefined) {
            if (taskArray[k] === "description") {
                let descriptionData = t_res.description === '' ? 'N/A' : t_res.description;
                taskDetails.push('<div class="muted">Description</div>');
                descriptionData.includes("\n") ?
                    taskDetails.push(`<div id="displayDetails"><div>${xssHandler(descriptionData).split("\n")[0]}</div><div>${xssHandler(descriptionData).split("\n")[1]}</div></div>`) :
                    taskDetails.push(`<div id="displayDetails"><div>${xssHandler(descriptionData)}</div></div>`);
                repeatFunction(client, taskDetails, taskArray, t_res, k, ticket_id, apiDomain, customDomain);
            } else {
                reduceComplexityTaskFields(client, taskDetails, taskArray, t_res, k, ticket_id, apiDomain, customDomain);
            }
        } else {
            $("#detailsPage").html(taskDetails);
            resizeApp(client);
        }
    }

    function reduceComplexityTaskFields(client, taskDetails, taskArray, t_res, k, ticket_id, apiDomain, customDomain) {
        if (taskArray[k] === "link") {
            var linkData = t_res.link === null || t_res.link === '' || t_res.link === undefined ? 'N/A' : t_res.link;
            taskDetails.push('<div class="muted">Link</div>');
            taskDetails.push('<div id="displayDetails" data-value="' + taskArray[k] + '"><a href="' + t_res.link + '" target="_blank" rel="noreferrer">' + linkData + '</a></div>');
            repeatFunction(client, taskDetails, taskArray, t_res, k, ticket_id, apiDomain, customDomain);
        } else {
            reduceComplexityOfTaskFields(client, taskDetails, taskArray, t_res, k, ticket_id, apiDomain, customDomain);
        }
    }

    function reduceComplexityOfTaskFields(client, taskDetails, taskArray, t_res, k, ticket_id, apiDomain, customDomain) {
        let v = taskArray[k];
        if (taskArray[k] === "responsible") {
            var responsibleData = t_res.responsible.name === null || t_res.responsible.name === '' || t_res.responsible.name === undefined ? 'N/A' : t_res.responsible.name;
            taskDetails.push('<div class="muted">Responsible</div>');
            taskDetails.push('<div id="displayDetails" data-value="' + v + '">' + responsibleData + '</div>');
            repeatFunction(client, taskDetails, taskArray, t_res, k, ticket_id, apiDomain, customDomain);
        } else {
            finalDetails(client, taskDetails, taskArray, t_res, k, ticket_id, apiDomain, customDomain);
        }
    }

    function finalDetails(client, taskDetails, taskArray, t_res, k, ticket_id, apiDomain, customDomain) {
        let v = taskArray[k], modified_label = taskArray[k].includes("_") ? taskArray[k].replace("_", " ") : taskArray[k];
        var dataRequired = t_res[v] === null || t_res[v] === '' || t_res[v] === undefined ? 'N/A' : t_res[v];
        taskDetails.push('<div class="muted">' + modified_label + '</div>');
        taskDetails.push('<div id="displayDetails" data-value="' + taskArray[k] + '">' + dataRequired + '</div>');
        repeatFunction(client, taskDetails, taskArray, t_res, k, ticket_id, apiDomain, customDomain);
    }

    function repeatFunction(client, taskDetails, taskArray, t_res, k, ticket_id, apiDomain, customDomain) {
        k++;
        iterateOverAllTaskFields(client, taskDetails, taskArray, t_res, k, ticket_id, apiDomain, customDomain);
    }
}); //ready