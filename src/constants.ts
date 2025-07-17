export const CONSTANTS = {
    DATA_ITEM_CANDIDATE: 100,
    DATA_ITEM_COMPANY: 200,
    DATA_ITEM_CONTACT : 300,
    DATA_ITEM_JOBORDER : 400,
    DATA_ITEM_BULKRESUME : 500,
    DATA_ITEM_USER : 600,
    DATA_ITEM_LIST : 700,
    DATA_ITEM_PIPELINE : 800,

    ACCESS_LEVEL_DISABLED: 0,
    ACCESS_LEVEL_READ: 100,
    ACCESS_LEVEL_EDIT : 200,
    ACCESS_LEVEL_DELETE : 300,
    ACCESS_LEVEL_HR : 310,
    ACCESS_LEVEL_DEMO : 350,
    ACCESS_LEVEL_SA : 400,
    ACCESS_LEVEL_MULTI_SA : 450,
    ACCESS_LEVEL_ROOT: 500,

    PIPELINE_STATUS_NOSTATUS: 0,
    PIPELINE_STATUS_NOCONTACT: 100,
    PIPELINE_STATUS_CANDIDATE_REPLIED : 250,
    PIPELINE_STATUS_CONTACTED : 200,
    PIPELINE_STATUS_QUALIFYING : 300,
    PIPELINE_STATUS_SUBMITTED : 400,
    PIPELINE_STATUS_INTERVIEWING : 500,
    PIPELINE_STATUS_OFFERED : 600,
    PIPELINE_STATUS_NOTINCONSIDERATION : 650,
    PIPELINE_STATUS_CLIENTDECLINED : 700,
    PIPELINE_STATUS_PLACED: 500,

    CALENDAR_EVENT_CALL: 100,
    CALENDAR_EVENT_EMAIL: 200,
    CALENDAR_EVENT_MEETING: 300,
    CALENDAR_EVENT_INTERVIEW: 400,
    CALENDAR_EVENT_PERSONAL: 500,
    CALENDAR_EVENT_OTHER: 600
};

export const JOBORDER_SELECT_QUERY_BODY = `
  SELECT
    joborder.joborder_id AS joborder_id,
    joborder.title AS title,
    joborder.type AS type,
    joborder.status AS status,
    company.company_id AS company_id,
    company.name AS company_name,
    recruiter_user.first_name AS recruiter_first_name,
    recruiter_user.last_name AS recruiter_last_name,
    owner_user.first_name AS owner_first_name,
    owner_user.last_name AS owner_last_name,
    joborder.start_date AS start_date,
    joborder.date_created AS date_created,
    joborder.date_modified AS date_modified,
    DATEDIFF(NOW(), joborder.date_created) AS daysOld,
    COUNT(candidate_joborder.joborder_id) AS pipeline,
    (
      SELECT COUNT(*)
      FROM candidate_joborder_status_history
      WHERE joborder_id = joborder.joborder_id
        AND status_to = 400
    ) AS submitted
  FROM joborder
  LEFT JOIN company
    ON joborder.company_id = company.company_id
  LEFT JOIN contact
    ON joborder.contact_id = contact.contact_id
  LEFT JOIN company_department
    ON joborder.company_department_id = company_department.company_department_id
  LEFT JOIN candidate_joborder
    ON joborder.joborder_id = candidate_joborder.joborder_id
  LEFT JOIN user AS recruiter_user
    ON joborder.recruiter = recruiter_user.user_id
  LEFT JOIN user AS owner_user
    ON joborder.owner = owner_user.user_id
`;

export const JOBORDER_DETAIL_QUERY_BODY = `
  SELECT
    joborder.*,
    company.company_id AS company_id,
    company.name AS company_name,
    company_department.name AS department_name,
    recruiter_user.first_name AS recruiter_first_name,
    recruiter_user.last_name AS recruiter_last_name,
    owner_user.first_name AS owner_first_name,
    owner_user.last_name AS owner_last_name,
    CONCAT(contact.first_name, ' ', contact.first_name) AS contact_name,
    contact.phone_work AS contact_phone,
    contact.email1 AS contact_email,
    CONCAT(contact.first_name, ' ', contact.first_name) AS contact_name,
    DATEDIFF(NOW(), joborder.date_created) AS daysOld,
    COUNT(candidate_joborder.joborder_id) AS pipeline,
    (
      SELECT COUNT(*)
      FROM candidate_joborder_status_history
      WHERE joborder_id = joborder.joborder_id
        AND status_to = 400
    ) AS submitted
  FROM joborder
  LEFT JOIN company
    ON joborder.company_id = company.company_id
  LEFT JOIN contact
    ON joborder.contact_id = contact.contact_id
  LEFT JOIN company_department
    ON joborder.company_department_id = company_department.company_department_id
  LEFT JOIN candidate_joborder
    ON joborder.joborder_id = candidate_joborder.joborder_id
  LEFT JOIN user AS recruiter_user
    ON joborder.recruiter = recruiter_user.user_id
  LEFT JOIN user AS owner_user
    ON joborder.owner = owner_user.user_id
`;