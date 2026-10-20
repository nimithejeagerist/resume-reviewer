from typing import List, Optional
from pydantic import BaseModel   

# Resume
class Contact(BaseModel):
    email: str
    phone: Optional[str] = None

class EducationItem(BaseModel):
    institution: str
    degree: str
    graduation: str
    
class ExperienceItem(BaseModel):
    title: str
    company: str
    duration: str
    bullets: List[str]
    
class ProjectItem(BaseModel):
    title: str
    description: str

class Resume(BaseModel):
    name: str
    contact: Contact
    education: List[EducationItem]
    experience: Optional[List[ExperienceItem]] = []
    skills: Optional[List[str]] = []
    projects: Optional[List[ProjectItem]] = []

# Job Description
class JobDescription(BaseModel):
    title: str
    company: str
    requiredSkills: List[str]
    preferredSkills: Optional[List[str]] = []
    responsibilities: List[str]
    experienceRequired: Optional[str] = None
    keywords: List[str]