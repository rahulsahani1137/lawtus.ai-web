export type CaseType =
    | 'bail_application'
    | 'civil_injunction'
    | 'writ_petition'
    | 'complaint'
    | 'reply'
    | 'vakalatnama'
    | 'written_statement'

export interface ChronologyEvent {
    date: string
    event: string
    legalRelevance: string
    documentRef?: string
}

export interface Draft {
    id: string
    userId: string
    caseType: CaseType
    title: string
    court: string
    content: string
    chronology?: ChronologyEvent[]
    warnings?: string[]
    isDeleted: boolean
    createdAt: string
    updatedAt: string
}

export interface DraftListItem {
    id: string
    caseType: CaseType
    title: string
    court: string
    createdAt: string
    updatedAt: string
}

export interface DraftGenerateInput {
    caseType: CaseType
    clientName: string
    opposingParty?: string
    court: string
    reliefSought: string
    facts: string
    documentIds?: string[]
    additionalContext?: string
}

export const CASE_TYPE_LABELS: Record<CaseType, string> = {
    bail_application: 'Bail Application',
    civil_injunction: 'Civil Injunction',
    writ_petition: 'Writ Petition',
    complaint: 'Complaint',
    reply: 'Reply',
    vakalatnama: 'Vakalatnama',
    written_statement: 'Written Statement',
}

export const CASE_TYPE_COLORS: Record<CaseType, string> = {
    bail_application: 'bg-blue-100 text-blue-800',
    civil_injunction: 'bg-purple-100 text-purple-800',
    writ_petition: 'bg-orange-100 text-orange-800',
    complaint: 'bg-red-100 text-red-800',
    reply: 'bg-gray-100 text-gray-800',
    vakalatnama: 'bg-teal-100 text-teal-800',
    written_statement: 'bg-indigo-100 text-indigo-800',
}
