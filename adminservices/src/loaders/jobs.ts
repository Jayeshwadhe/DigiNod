import config from '../config';
import EmailSequenceJob from '../jobs/emailSequence';
import Agenda from 'agenda';
import dashboardDataJob from '../jobs/dashboardDataJob';

export default ({ agenda }: { agenda: Agenda }) => {
  agenda.define(
    'send-email',
    { priority: 'high', concurrency: config.agenda.concurrency },
    // @TODO Could this be a static method? Would it be better?
    new EmailSequenceJob().handler,
  );
  agenda.define(
    'updateDashboardData',
    {priority: 'high', concurrency: config.agenda.concurrency},
    new dashboardDataJob().handler,
  );

  (async function() {
    await agenda.start();
    await agenda.every('0 2 * * *',"updateDashboardData", {},{ timezone: "Asia/Kolkata"})
  })();
};
