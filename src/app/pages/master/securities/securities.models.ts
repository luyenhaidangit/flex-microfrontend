export interface SecuritiesFilter {
	securitiesCode?: string;
	issuerCode?: string;
	domainCode?: string;
	symbol?: string;
	isinCode?: string;
}

export interface SecuritiesItem {
	securitiesCode: string;
	issuerCode: string;
	domainCode: string;
	symbol: string;
	isinCode?: string;
}

export interface SecuritiesSearchParams {
	pageIndex: number;
	pageSize: number;
	securitiesCode?: string;
	issuerCode?: string;
	domainCode?: string;
	symbol?: string;
	isinCode?: string;
	orderBy?: string;
	sortBy?: string;
	[key: string]: any;
}
