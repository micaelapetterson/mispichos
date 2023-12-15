const moment = require('moment')
const fs = require('fs');

const realSpots = []
const daySlotsNew = []
let daySlots = []


function getAvailableSpots(calendar, date, duration ) {

	// Se traen los datos.
	let rawdata = fs.readFileSync('./calendars/calendar.' + calendar + '.json');
	let data = JSON.parse(rawdata);
	const dateISO = moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD')
	let durationBefore = data.durationBefore;
	let durationAfter = data.durationAfter;
	for (const key in data.slots) {
		if (key === date) {
			daySlots = data.slots[key]
		}
	}

	// Se eliminan de la lista de horarios disponibles, los no disponibles.
	const horariosDisponibles = eliminarHorariosNoDisponibles(daySlots, data.sessions[date]);	

	// Se unifican entre sí los horarios ya reservados, si es que se pisan.
	let horariosUnificados = null;
	if(data.sessions[date]){
		horariosUnificados = unificarHorarios(data.sessions[date]);
	}

	// Se toman los horarios disponibles, de encontrarse parcialmente reservados, se quita este rango ya reservado.
	const realSpots = ajustarHorariosDisponibles(horariosDisponibles, horariosUnificados);	


/* No se realizan cambios en esta parte del código */
	let arrSlot = [];
	realSpots.forEach(function (slot) {


		let init = 0;
		let startHour;
		let endHour;
		let clientStartHour;
		let clientEndHour;

		function getMomentHour(hour) {
		  let finalHourForAdd = moment(dateISO + ' ' + hour);
		  return finalHourForAdd;
		}
		function addMinutes(hour, minutes) {
		  let result = moment(hour).add(minutes, 'minutes').format('HH:mm');
		  return result;
		}
		function removeMinutes(hour, minutes) {
		  let result = moment(hour).subtract(minutes, 'minutes').format('HH:mm');
		  return result;
		}
		function getOneMiniSlot(startSlot, endSlot) {
		  let startHourFirst = getMomentHour(startSlot);
		  
			startHour = startHourFirst.format('HH:mm');;
			endHour = addMinutes(startHourFirst, durationBefore + duration + durationAfter);
			clientStartHour = addMinutes(startHourFirst, durationBefore);
			clientEndHour = addMinutes(startHourFirst, duration);

		  if (moment.utc(endHour, 'HH:mm').valueOf() > moment.utc(endSlot, 'HH:mm').valueOf()) {
			return null;
		  } 
		  const objSlot = {
			startHour: moment.utc(dateISO + ' ' + startHour)
			  .toDate(),
			endHour: moment.utc(dateISO + ' ' + endHour)
			  .toDate(),
			clientStartHour: moment.utc(dateISO + ' ' + clientStartHour)
			  .toDate(),
			clientEndHour: moment.utc(dateISO + ' ' + clientEndHour)
			  .toDate(),
		  };
		  init += 1;
		  return objSlot;
		}

		let start = slot.start;
		let resultSlot;
		do {
		  resultSlot = getOneMiniSlot(start, slot.end);
		  if (resultSlot) {
			arrSlot.push(resultSlot);
			start = moment.utc(resultSlot.endHour).format('HH:mm')
		  }
		} while (resultSlot);

		return arrSlot;
	});
	return arrSlot;

/* No se realizan cambios en esta parte del código */

}

function eliminarHorariosNoDisponibles(horarios, rangosOcupados){

	const horariosYaEliminados = horarios.filter(horario => {
		
		if(rangosOcupados){
			const ocupado = rangosOcupados.some(rango =>
				horario.start >= rango.start && horario.end <= rango.end
			);
		
			return !ocupado;
		}else{
			return horarios;
		}
	});
	
	return horariosYaEliminados;
}


function ajustarHorariosDisponibles(horarios, rangosOcupados) {

	const realSpots = [];

	horarios.forEach(horario => {

		let coincide = false;

		if(rangosOcupados){

				rangosOcupados.forEach(rangoOcupado => {

				if( rangoOcupado.start <= horario.start && 
					rangoOcupado.end < horario.end && 
					rangoOcupado.end > horario.start ){

					coincide = true;

					realSpots.push({ start: rangoOcupado.end, end: horario.end})
				}
				else if( rangoOcupado.start > horario.start && rangoOcupado.start < horario.end && rangoOcupado.end >= horario.end ){
					
					coincide = true;

					realSpots.push({ start: horario.start, end: rangoOcupado.start})
				}
				else if  ( (rangoOcupado.start > horario.start && rangoOcupado.end < horario.end) ) {

					coincide = true;

					realSpots.push({ start: horario.start, end: rangoOcupado.start})
					realSpots.push({ start: rangoOcupado.end, end: horario.end})
				}

			});

		}

		if (coincide == false){
			realSpots.push({ start: horario.start, end: horario.end})
		}

	});
	  
	return realSpots;

}



function unificarHorarios(horarios) {
	const resultado = [];
  
	// Ordenar los horarios por la hora de inicio
	horarios.sort((a, b) => a.start.localeCompare(b.start));
  
	let horarioActual = horarios[0];
  
	for (let i = 1; i < horarios.length; i++) {
	  const horarioSiguiente = horarios[i];
  
	  // Verificar si hay superposición de horarios
	  if (horarioSiguiente.start <= horarioActual.end) {

		// Unificar horarios si hay superposición
		if( (horarioActual.end > horarioSiguiente.end) || (horarioActual.end == horarioSiguiente.end) ){
			horarioActual.end = horarioActual.end;
		}else{
			horarioActual.end = horarioSiguiente.end;
		}

	  } else {
		// No hay superposición, agregar el horario actual al resultado
		resultado.push({ start: horarioActual.start, end: horarioActual.end });
		horarioActual = horarioSiguiente;
	  }
	}
  
	// Agregar el último horario al resultado
	resultado.push({ start: horarioActual.start, end: horarioActual.end });
  
	return resultado;
}
  
  
  
module.exports = { getAvailableSpots }
