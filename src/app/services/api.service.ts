import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private http = inject(HttpClient);
    private basePath = environment.apiBaseUrl;

    login(username: string, password: string): Observable<any> {
        const payload = { username, password };
        return this.http.post<any>(`${this.basePath}/login`, payload).pipe(
            catchError((err) => throwError(() => err))
        );
    }

    logout<T>(): Observable<T> {
        return this.http.post<T>(`${this.basePath}/logout`, {}).pipe(
            catchError((err) => throwError(() => err))
        );
    }

    getFilters<T>(): Observable<T> {
        return this.http.post<T>(`${this.basePath}/filter`, {}).pipe(
            catchError((err) => throwError(() => err))
        );
    }

    getShortlistCounts<T>(): Observable<T> {
        return this.http.post<T>(`${this.basePath}/shortlist_count`, {}).pipe(
            catchError((err) => throwError(() => err))
        );
    }

    getShortlistFilterList<T>(): Observable<T> {
        return this.http.post<T>(`${this.basePath}/shortlisted_filter/list`, {}).pipe(
            catchError((err) => throwError(() => err))
        );
    }

    getEmailTemplates<T>(): Observable<T> {
        return this.http.post<T>(`${this.basePath}/email/templates`, {}).pipe(
            catchError((err) => throwError(() => err))
        );
    }
    getEmailTemplatesList<T>(): Observable<T> {
        return this.http.post<T>(`${this.basePath}/email/templates/names`, {}).pipe(
            catchError((err) => throwError(() => err))
        );
    }
    getReplyTemplatesList<T>(): Observable<T> {
        return this.http.post<T>(`${this.basePath}/reply/templates/names`, {}).pipe(
            catchError((err) => throwError(() => err))
        );
    }

    getEmailTemplateDetails<T>(template_name: string, agent_detail: any): Observable<T> {
        let payload: { agent_detail: any; template_name: string; } = { agent_detail, template_name };
        return this.http.post<T>(`${this.basePath}/template/detail`, payload).pipe(
            catchError((err) => throwError(() => err))
        );
    }

    clearShortlist<T>(selectedFilters: any): Observable<T> {
        let payload: { selectedFilters: any; } = { selectedFilters };
        return this.http.post<T>(`${this.basePath}/clear_all_shortlisted`, payload).pipe(
            catchError((err) => throwError(() => err))
        );
    }


    shortListAgent<T>(agent_detail: any, filters: any): Observable<T> {
        let payload: { agent_detail: any; filters: any; } = { agent_detail, filters };
        return this.http.post<T>(`${this.basePath}/shortlist_agent`, payload).pipe(
            catchError((err) => throwError(() => err))
        );
    }




    getShortlistedDetails<T>(selectedFilters: any): Observable<T> {
        let payload: { selectedFilters: any; } = { selectedFilters };
        return this.http.post<T>(`${this.basePath}/get/shortlisted/details`, payload).pipe(
            catchError((err) => throwError(() => err))
        );
    }


    getAgents<T>(selectedFilters: JSON): Observable<T> {
        const payload = { selectedFilters };
        return this.http.post<T>(`${this.basePath}/get/agents`, payload).pipe(
            catchError((err) => throwError(() => err))
        );
    }

    getAgentDetails<T>(selectedFilters: JSON): Observable<T> {
        const payload = { selectedFilters };
        return this.http.post<T>(`${this.basePath}/get/agents/details`, payload).pipe(
            catchError((err) => throwError(() => err))
        );
    }

    aboutAgent<T>(agent_detail: any): Observable<T> {
        let payload: { agent_detail: any } = { agent_detail };
        return this.http.post<T>(`${this.basePath}/agent/profile_summary`, payload).pipe(
            catchError((err) => throwError(() => err))
        );
    }
}
