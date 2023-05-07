const Job = require("../model/Job");

var key;

const jobsinfo=Job.find().toArray();

function search(data)
{
    key=data;
    jobsinfo.forEach(job => {
        if(key==job.title)
        {
            return
            <h3 class="mb-3">job.title</h3>,
            <span class="text-truncate me-3"><i class="fa fa-map-marker-alt text-primary me-2"></i>job.location</span>,
            <span class="text-truncate me-0"><i class="far fa-money-bill-alt text-primary me-2"></i>job.salary</span>
        }
    });
}