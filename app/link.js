$(document).ready(function() {
    app.initialized().then(function(_client) {
        $("#load").show();
        $("#selectTask, #linkTaskDiv, #divError, #successMSG, #errorMsg").hide();
        var podioClient = _client;
        $("#linkTaskButton").click(function() {
            $('#divError, #load').hide();
            $("#linkTaskButton").text("Linking...").prop("disabled", true);
            validation(podioClient);
        });
        $("#selectTask").change(function() {
            $("#load").hide();
            $("#linkTaskButton").text("Link Task").prop("disabled", false);
            $('#divError').hide();
        });
        invokeGetTasksFunction(podioClient);
    }, function(error) {
        handleError(error);
    }); //initialized

    var getTicketID = function(podioClient, callback) {
        podioClient.data.get('ticket').then(function(tdata) {
            var t_id = tdata.ticket.id;
            var ticketId = btoa(t_id);
            callback(ticketId);
        }, function(error) {
            handleError(error);
        });
    }
    var getIparamsData = function(podioClient, callback) {
        podioClient.iparams.get().then(function(iparamData) {
            var spaceId = iparamData.workSpaceID;
            callback(spaceId);
        }, function(error) {
            handleError(error);
        });
    }

    function invokeGetTasksFunction(podioClient) {
        $('#selectTask').select2();
        getIparamsData(podioClient, function(iData) {
            var space_id = btoa(iData);
            var options = {
                "spaceId": space_id
            };
            podioClient.request.invoke("fetchTasksToLink", options).then(function(tData) {
                var result = tData.response.body;
                if (Object.keys(result).length === 0) {
                    $("#successMSG").show().html("There are no active tasks present in Podio to link.").removeClass("colorGreen");
                    $("#load").hide();
                } else {
                    var map = new Map();
                    var liList = [];
                    liList.push("<option value='select' selected disabled>Select</option>");
                    if (result.length !== 0) {
                        $.each(result, function(k, v) {
                            map[k] = v;
                            liList.push("<option value=" + v + ">" + k + "</option>");
                        });
                        $("#load").hide();
                        $('#selectTask').show().html(liList);
                        $("#linkTaskDiv").show();
                    }
                }
            }, function(error) {
                $("#linkTaskButton").text("Link Task").prop("disabled", false);
                $("#load").hide();
                setTimeout(function() {
                    closeModal(podioClient);
                }, 2000);
                handleError(error);
            });
        }, function(error) {
            handleError(error);
        });
    }

    function validation(podioClient) {
        var selectedTask = $('#selectTask').val();
        if (selectedTask === 'Select' || selectedTask === null || selectedTask === undefined) {
            $('#divError').text("Please select the task.").show();
            $("#linkTaskButton").text("Link Task").prop("disabled", false);
            $("#load").hide();
        } else {
            var taskId = selectedTask;
            var encodedTaskId = btoa(taskId);
            getTicketID(podioClient, function(ticket_id) {
                podioClient.db.set(ticket_id, {
                    task_id: encodedTaskId
                }).then(function() {
                    $("#load").hide();
                    $("#linkTaskButton").text("Task Linked").prop("disabled", true);
                    $('#successMSG').show().text("Task linked successfully").addClass("colorGreen");
                    podioClient.instance.send({
                        message: {
                            msg: "success"
                        }
                    });
                    setTimeout(function() {
                        podioClient.instance.close();
                    }, 2000);
                }, function() {
                    $('#divError').show().text("Failed to link Podio task.");
                    $("#load").hide();
                    $("#linkTaskButton").text("Link Task").prop("disabled", false);
                    setTimeout(function() {
                        closeModal(podioClient);
                    }, 2000);
                });
            });
        }
    }
});