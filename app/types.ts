export interface ProcessedCandidate {
    // Basic info
    id: string;
    slug: string;
    name: string;
    email: string;
    contact_number: string;
    
    // Professional info
    current_status: string;
    position: string;
    skills: string[] | string;
    experience: string;
    status: string;
    
    // Resume info
    resumeLink: string | undefined;
    resumeText: string | null;
    resumeAnalysis: {
        score: number;
        status: string;
        suitable: boolean;
        summary: string;
        coldEmail: string;
    } | null;
    
    // Dates
    createdOn: string;
    
    // Additional details
    avatar: string;
    gender_id: string;
    qualification_id: string;
    specialization: string;
    work_ex_year: string;
    candidate_dob: string;
    current_salary: string;
    salary_expectation: string;
    willing_to_relocate: string;
    current_organization: string;
    notice_period: string;
    currency_id: string;
    
    // Social links
    facebook: string;
    twitter: string;
    linkedin: string;
    github: string;
    xing: string;
    
    // Location
    city: string;
    locality: string;
    state: string;
    country: string;
    address: string;
    
    // Additional professional details
    relevant_experience: string;
    available_from: string;
    source: string;
    language_skills: string;
    candidate_summary: string;
    custom_fields: any;
    
    // Communication history
    last_calllog_added_on: string;
    last_email_sent_on: string;
    last_sms_sent_on: string;
    last_communication: string;
}
