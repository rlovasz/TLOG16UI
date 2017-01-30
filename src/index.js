/* global selectedMonth, year, month, day */

$(document).ready(function () {
	var selectedMonth = new Date();
	var year = 0;
	var month = 0;
	var day = 0;
	drawCalendar();

	$("#requiredMinPerDay").keyup(function () {
		$('#requiredMinPerDay').attr("value", this.value);
	});

	$(document).on("click", ".btn.add-day", function () {
		var id = "";
		id = $(this).attr("id");
		var dataIdSplitted = id.split("-");
		year = parseInt(dataIdSplitted[0]);
		month = parseInt(dataIdSplitted[1]);
		day = parseInt(dataIdSplitted[2]);
	});

	$("#setHourButton").click(function () {
		var requiredHoursS = $("#requiredMinPerDay").attr('value');
		$('#requiredMinPerDay').attr("value", "");
		$('#setHour')[0].reset();
		var requiredHours = parseFloat(requiredHoursS);
		var workDayBean = {
			"year": year,
			"month": month,
			"day": day,
			"requiredHours": requiredHours
		};
		postAjax("http://127.0.0.1:9090/tlog-backend/timelogger/workmonths/workdays", workDayBean, addDay, addWeekendDay);
	});

	$("#nextMonth").click(function () {
		addMonth(1);
	});

	$("#prevMonth").click(function () {
		addMonth(-1);
	});

	$("#selected-month").text(getSelectedMonthText());

	function addDay(json) {
		addDayAndSetStatistics(json);
		changeCellWhenDayCreated();
	}

	function addWeekendDay(json, workDayBean) {
		if (json.status === 303) {
			if (confirm('Are you sure that this weekend day is a work day')) {
				postAjax("http://127.0.0.1:9090/tlog-backend/timelogger/workmonths/workdays/weekend", workDayBean, addDay, function () {});
			}

		}
	}

	function postAjax(actualUrl, workDayBean, successCallback, errorCallback) {
		$.ajax({
			type: "POST",
			url: actualUrl,
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			data: JSON.stringify(workDayBean),
			traditional: true,
			success: function (json) {
				successCallback(json);
			},
			error: function (json) {
				if (json.status === 200) {
					successCallback(json);
				} else {
					errorCallback(json, workDayBean);
				}
			}
		});
	}

	function getSelectedMonthText() {
		return selectedMonth.getFullYear() + "-" + (selectedMonth.getMonth() + 1);
	}

	function addMonth(month) {
		selectedMonth.addMonths(month);
		$("#selected-month").text(getSelectedMonthText());
		drawCalendar();
	}

	function changeCellWhenDayCreated() {
		$("button[id='" + generateIdFromDate() + "']").css("visibility", "hidden");
		$("div[id='" + generateIdFromDate() + "']").css("background", "white");
		$("span[id='" + generateIdFromDate() + "']").css("display", "block");
		$("div[id='" + generateIdFromDate() + "']").children("p").css("visibility", "visible");
	}

	function generateIdFromDate() {
		return year.toString() + "-" + month.toString() + "-" + day.toString();
	}

	function appendWorkDay(json) {
		$(".row.calendar-week").last().append('\
							<div class="col-xs-1 grid-cell day work">\n\
							<p class="dayOfMonth"></p>\n\
							<p class="extraDaily">Extra minutes: ' + json.extraMinPerDay + '</p><br>\n\
							<button type="button" class="btn add-day" data-toggle="modal" data-target="#myModal"><span class="glyphicon glyphicon-plus"></span></button><br><br>\n\
							<a href="listTasks.html"><span class="glyphicon glyphicon-pencil"></span></a>\n\
							</div>');
		if (parseInt(json.extraMinPerDay) < 0) {
			$(".day.work .extraDaily").last().css("color", "red");
		} else {
			$(".day.work .extraDaily").last().css("color", "green");
		}
	}

	function appendDay() {
		$(".row.calendar-week").last().append('\
						<div class="col-xs-1 grid-cell day">\n\
						<p class="dayOfMonth"></p>\n\
						<p class="extraDaily">Extra minutes: </p><br>\n\
						<button type="button" class="btn add-day" data-toggle="modal" data-target="#myModal"><span class="glyphicon glyphicon-plus"></span></button><br><br>\n\
						<a href="listTasks.html"><span class="glyphicon glyphicon-pencil"></span></a>\n\
						</div>');
	}

	function generateDateText(year, month, day) {
		return year + "-" + month + "-" + day;
	}

	function drawMonth(json) {
		var daysInMonth = selectedMonth.getDaysInMonth();
		var dayTypeOfFirstDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 0).getDay();
		var drawn = false;
		for (var i = dayTypeOfFirstDay; i < daysInMonth + dayTypeOfFirstDay; i++) {
			drawn = false;
			for (var j = 0; j < json.length; j++) {
				var splittedActualDay = json[j].actualDay.split("-");
				if (i - dayTypeOfFirstDay + 1 === parseInt(splittedActualDay[2])) {
					appendWorkDay(json[j]);
					drawn = true;
				}
			}
			if (drawn === false) {
				appendDay();
			}
			var dateText = generateDateText(selectedMonth.getFullYear().toString(), (selectedMonth.getMonth() + 1).toString(), (i - dayTypeOfFirstDay + 1).toString());
			$(".grid-cell p.dayOfMonth").last().append(i - dayTypeOfFirstDay + 1);
			$(".grid-cell.day").last().attr("id", dateText);
			$(".btn.add-day").last().attr("id", dateText);
			$(".glyphicon-pencil").last().attr("id", dateText);
			if ((i + 1) % 7 === 0 && (i + 1) !== (dayTypeOfFirstDay + daysInMonth)) {
				$(".grid-calendar").append('<div class="row calendar-week" ></div>');
			}
		}
		var i = dayTypeOfFirstDay + daysInMonth;
		while (i % 7 !== 0) {
			$(".row.calendar-week").last().append('<div class="col-xs-1 grid-cell day empty"></div>');
			i++;
		}
	}

	function drawStatistics(json) {
		for (var i = 0; i < json.length; i++) {
			var monthDateSplitted = json[i].monthDate.split("-");
			if (parseInt(monthDateSplitted[0]) === selectedMonth.getFullYear() && parseInt(monthDateSplitted[1]) === selectedMonth.getMonth() + 1) {
				$("#extraMonthly").next().text(" " + json[i].extraMinPerMonth);
				$("#sumMonthly").next().text(" " + json[i].sumPerMonth);
				if (parseInt(json[i].extraMinPerMonth) >= 0) {
					$("#extraMonthly").css("color", "green");
					$("#extraMonthly").next().css("color", "green");
				} else {
					$("#extraMonthly").css("color", "red");
					$("#extraMonthly").next().css("color", "red");
				}
			}
		}
	}

	function getAjax(url, successCallback) {
		$.ajax({
			type: "GET",
			url: url,
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			traditional: true,
			success: function (json) {
				successCallback(json);
			}
		});
	}

	function drawCalendar() {
		$(".row.calendar-week").remove();
		$(".grid-calendar").append('<div class="row calendar-week" ></div>');
		var dayTypeOfFirstDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 0).getDay();
		for (var i = 0; i < dayTypeOfFirstDay; i++) {
			$(".row.calendar-week").append('<div class="col-xs-1 grid-cell day empty"></div>');
		}
		getAjax("http://127.0.0.1:9090/tlog-backend/timelogger/workmonths/" + selectedMonth.getFullYear().toString() + "/" + (selectedMonth.getMonth() + 1).toString(), drawMonth);
		getAjax("http://127.0.0.1:9090/tlog-backend/timelogger/workmonths", drawStatistics);
	}

	function setTheMonthlyStatistics(json) {
		for (var i = 0; i < json.length; i++) {
			var monthDateSplitted = json[i].monthDate.split("-");
			if (parseInt(monthDateSplitted[0]) === year && parseInt(monthDateSplitted[1]) === month) {
				$("#extraMonthly").next().text(" " + json[i].extraMinPerMonth);
				$("#sumMonthly").next().text(" " + json[i].sumPerMonth);
				if (parseInt(json[i].extraMinPerMonth) >= 0) {
					$("#extraMonthly").css("color", "green");
					$("#extraMonthly").next().css("color", "green");
				} else {
					$("#extraMonthly").css("color", "red");
					$("#extraMonthly").next().css("color", "red");
				}
				$("div[id='" + generateIdFromDate() + "']").children(".extraDaily").append((json[i].days)[json[i].days.length - 1].extraMinPerDay);
				if ((json[i].days)[json[i].days.length - 1].extraMinPerDay >= 0) {
					$("div[id='" + generateIdFromDate() + "']").children(".extraDaily").css("color", "green");
				} else
					$("div[id='" + generateIdFromDate() + "']").children(".extraDaily").css("color", "red");
			}
		}
	}

	function addDayAndSetStatistics(json) {
		getAjax("http://127.0.0.1:9090/tlog-backend/timelogger/workmonths", setTheMonthlyStatistics);
	}
});