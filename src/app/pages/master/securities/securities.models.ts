export interface SecuritiesFilter {
	securitiesCode: string;
}

export interface SecuritiesItem {
	securitiesCode: string;
	issuerCode: string;
	issuerName: string;
	domainCode: string;
	domainName: string;
	symbol: string;
	isinCode?: string;
}

export interface SecuritiesSearchParams {
	pageIndex: number;
	pageSize: number;
	securitiesCode?: string;
	orderBy?: string;
	sortBy?: string;
	[key: string]: any;
}
