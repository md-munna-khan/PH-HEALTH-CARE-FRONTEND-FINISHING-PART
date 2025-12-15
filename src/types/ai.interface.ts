export interface AIDoctorSuggestionInput {
    symptoms: string;
}

export interface AISuggestedDoctor {
    id: string;
    name: string;
    specialties: string[];
    experience: number;
    averageRating: number;
    appointmentFee: number;
    profilePhoto?: string | null;
    qualification?: string;
    designation?: string;
    currentWorkingPlace?: string;
}