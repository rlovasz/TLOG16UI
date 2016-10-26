/* global selectedMonth, year, month, day */

$(document).ready(function () {
	var selectedMonth = new Date();
	var year = 0;
	var month = 0;
	var day = 0;
	drawCalendar(selectedMonth);
	
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
		console.log(id);
		console.log(year);
		console.log(month);
		console.log(day);
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
		$.ajax({
			type: "POST",
			url: "http://127.0.0.1:9090/tlog-backend/timelogger/workmonths/workdays",
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			data: JSON.stringify(workDayBean),
			traditional: true,
			success: function (json) {
			console.log(json);
				$.ajax({
					type: "GET",
					url: "http://127.0.0.1:9090/tlog-backend/timelogger/workmonths",
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					traditional: true,
					success: function (json) {
						console.log(json);
						console.log(json[0]);
						console.log(json[0].requiredMinPerMonth);
						console.log(json[0].sumPerMonth);
						console.log(json[0].extraMinPerMonth);
						console.log(json[0].days);
						console.log((json[0].days)[json[0].days.length - 1]);
						for (i = 0; i < json.length; i++) {
							var monthDateSplitted = json[i].monthDate.split("-");
							if (parseInt(monthDateSplitted[0]) === year && parseInt(monthDateSplitted[1]) === month){
								$("#extraMonthly").next().text(" " + json[i].extraMinPerMonth);
								$("#sumMonthly").next().text(" " + json[i].sumPerMonth);
								if (parseInt(json[i].extraMinPerMonth) >= 0){
									$("#extraMonthly").css("color", "green");
									$("#extraMonthly").next().css("color", "green");
								} else {
									$("#extraMonthly").css("color", "red");
									$("#extraMonthly").next().css("color", "red");
								}
								$("div[id='" + year.toString() + "-" + month.toString() + "-" + day.toString() + "']").children("#extraDaily").append((json[i].days)[json[i].days.length - 1].extraMinPerDay);
								if ((json[i].days)[json[i].days.length - 1].extraMinPerDay >= 0){
									$("div[id='" + year.toString() + "-" + month.toString() + "-" + day.toString() + "']").children("#extraDaily").css("color", "green");
								} else $("div[id='" + year.toString() + "-" + month.toString() + "-" + day.toString() + "']").children("#extraDaily").css("color", "red");
							}
						}
					}
				});
			}
		});
		$("button[id='" + year.toString() + "-" + month.toString() + "-" + day.toString() + "']").css("visibility", "hidden");
		$("div[id='" + year.toString() + "-" + month.toString() + "-" + day.toString() + "']").css("background", "white");
		$("span[id='" + year.toString() + "-" + month.toString() + "-" + day.toString() + "']").css("display", "block");
		$("div[id='" + year.toString() + "-" + month.toString() + "-" + day.toString() + "']").children("p").css("visibility", "visible");
	});
		
		/*calendar pagination*/
	$("#nextMonth").click(function () {
		selectedMonth.addMonths(1);
		$("#selected-month").text(selectedMonth.getFullYear() + "-" + (selectedMonth.getMonth() + 1));
		drawCalendar(selectedMonth);
	});
		
	$("#prevMonth").click(function () {
		selectedMonth.addMonths( - 1);
		$("#selected-month").text(selectedMonth.getFullYear() + "-" + (selectedMonth.getMonth() + 1));
		drawCalendar(selectedMonth);
	});
	
	$("#selected-month").text(selectedMonth.getFullYear() + "-" + (selectedMonth.getMonth() + 1));
	
	function drawCalendar(actualMonth) {
		$(".row.calendar-week").remove();
		$(".grid-calendar").append('<div class="row calendar-week" ></div>');
		var daysInMonth = actualMonth.getDaysInMonth();
		var dayTypeOfFirstDay = new Date(actualMonth.getFullYear(), actualMonth.getMonth(), 0).getDay();
		for (i = 0; i < dayTypeOfFirstDay; i++) {
			$(".row.calendar-week").append('<div class="col-xs-1 grid-cell day empty"></div>');
		}
		$.ajax({
			type: "GET",
			url: "http://127.0.0.1:9090/tlog-backend/timelogger/workmonths/" + actualMonth.getFullYear().toString() + "/" + (actualMonth.getMonth() + 1).toString(),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			traditional: true,
			success: function (json) {
				var drawn = false;
				for (i = dayTypeOfFirstDay; i < daysInMonth + dayTypeOfFirstDay; i++) {
					drawn = false;
					for (j = 0; j < json.length; j++) {
						var splittedActualDay = json[j].actualDay.split("-");
						if (i - dayTypeOfFirstDay + 1 === parseInt(splittedActualDay[2])) {
							$(".row.calendar-week").last().append('\
							<div class="col-xs-1 grid-cell day work">\n\
							<p id="dayOfMonth"></p>\n\
							<p id="extraDaily">Extra minutes: ' + json[j].extraMinPerDay + '</p><br>\n\
							<button type="button" class="btn add-day" data-toggle="modal" data-target="#myModal"><span class="glyphicon glyphicon-plus"></span></button><br><br>\n\
							<a href="listTasks.html"><span class="glyphicon glyphicon-pencil"></span></a>\n\
							</div>');
							if (parseInt(json[j].extraMinPerDay) < 0) {
								console.log(parseInt(json[j].extraMinPerDay));
								console.log(typeof parseInt(json[j].extraMinPerDay))
								console.log(parseInt(json[j].extraMinPerDay) < 0)
								$(".day.work #extraDaily").last().css("color", "red");
							} else {
								$(".day.work #extraDaily").last().css("color", "green");
							}
							drawn = true;
						}
					}
					if (drawn === false) {
						$(".row.calendar-week").last().append('\
						<div class="col-xs-1 grid-cell day">\n\
						<p id="dayOfMonth"></p>\n\
						<p id="extraDaily">Extra minutes: </p><br>\n\
						<button type="button" class="btn add-day" data-toggle="modal" data-target="#myModal"><span class="glyphicon glyphicon-plus"></span></button><br><br>\n\
						<a href="listTasks.html"><span class="glyphicon glyphicon-pencil"></span></a>\n\
						</div>');
					}
					$(".grid-cell p#dayOfMonth").last().append(i - dayTypeOfFirstDay + 1);
					$(".grid-cell.day").last().attr("id", actualMonth.getFullYear().toString() + "-" + (actualMonth.getMonth() + 1).toString() + "-" + (i - dayTypeOfFirstDay + 1).toString());
					$(".btn.add-day").last().attr("id", actualMonth.getFullYear().toString() + "-" + (actualMonth.getMonth() + 1).toString() + "-" + (i - dayTypeOfFirstDay + 1).toString());
					$(".glyphicon-pencil").last().attr("id", actualMonth.getFullYear().toString() + "-" + (actualMonth.getMonth() + 1).toString() + "-" + (i - dayTypeOfFirstDay + 1).toString());
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
		});
		$.ajax({
			type: "GET",
			url: "http://127.0.0.1:9090/tlog-backend/timelogger/workmonths",
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			traditional: true,
			success: function (json) {
				for (i = 0; i < json.length; i++) {
					var monthDateSplitted = json[i].monthDate.split("-");
					if (parseInt(monthDateSplitted[0]) === actualMonth.getFullYear() && parseInt(monthDateSplitted[1]) === actualMonth.getMonth() + 1){
						$("#extraMonthly").next().text(" " + json[i].extraMinPerMonth);
						$("#sumMonthly").next().text(" " + json[i].sumPerMonth);
								if (parseInt(json[i].extraMinPerMonth) >= 0){
									$("#extraMonthly").css("color", "green");
									$("#extraMonthly").next().css("color", "green");
								} else {
									$("#extraMonthly").css("color", "red");
									$("#extraMonthly").next().css("color", "red");
								}
						}
						}
						}
				
				});
			}
	});
				



