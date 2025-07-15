
import moment from 'moment';
export const calculateFreeSlots = (availabilities, appointments, dateRange) => {
  const { startDate, endDate } = dateRange;
  const freeSlots = [];

  let currentDate = moment(startDate);
  const lastDate = moment(endDate);

  while (currentDate.isSameOrBefore(lastDate, 'day')) {
    const dayName = currentDate.format('dddd');
    const dayAvailabilities = availabilities.filter(a => a.day_of_week === dayName);
    const dayAppointments = appointments.filter(a =>
      moment(a.appointment_date).local().format('YYYY-MM-DD') === currentDate.format('YYYY-MM-DD')
    );

    dayAvailabilities.forEach(avail => {
      let slotStart = moment(`${currentDate.format('YYYY-MM-DD')}T${avail.start_time}`);
      const slotEnd = moment(`${currentDate.format('YYYY-MM-DD')}T${avail.end_time}`);

      while (slotStart.isBefore(slotEnd)) {
        const slotFinish = moment.min(slotStart.clone().add(60, 'minutes'), slotEnd);

        const isTaken = dayAppointments.some(app => {
          const appStart = moment(`${moment(app.appointment_date).local().format('YYYY-MM-DD')}T${app.start_time}`);
          const appEnd = moment(`${moment(app.appointment_date).local().format('YYYY-MM-DD')}T${app.end_time}`);
          return slotStart.isBefore(appEnd) && slotFinish.isAfter(appStart);
        });

        if (!isTaken) {
          freeSlots.push({
            date: currentDate.format('YYYY-MM-DD'),
            startTime: slotStart.format('HH:mm'),
            endTime: slotFinish.format('HH:mm')
          });
        }

        slotStart = slotFinish;
      }
    });

    currentDate.add(1, 'day');
  }

  return freeSlots;
};
