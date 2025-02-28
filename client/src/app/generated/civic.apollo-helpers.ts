import type { FieldPolicy, FieldReadFunction, TypePolicies, TypePolicy } from '@apollo/client/cache';
export type AcceptRevisionsPayloadKeySpecifier = ('clientMutationId' | 'revisions' | 'supersededRevisions' | AcceptRevisionsPayloadKeySpecifier)[];
export type AcceptRevisionsPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	revisions?: FieldPolicy<any> | FieldReadFunction<any>,
	supersededRevisions?: FieldPolicy<any> | FieldReadFunction<any>
};
export type AcmgCodeKeySpecifier = ('code' | 'description' | 'id' | 'name' | 'tooltip' | AcmgCodeKeySpecifier)[];
export type AcmgCodeFieldPolicy = {
	code?: FieldPolicy<any> | FieldReadFunction<any>,
	description?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	tooltip?: FieldPolicy<any> | FieldReadFunction<any>
};
export type AddCommentPayloadKeySpecifier = ('clientMutationId' | 'comment' | AddCommentPayloadKeySpecifier)[];
export type AddCommentPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	comment?: FieldPolicy<any> | FieldReadFunction<any>
};
export type AddDiseasePayloadKeySpecifier = ('clientMutationId' | 'disease' | 'new' | AddDiseasePayloadKeySpecifier)[];
export type AddDiseasePayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	disease?: FieldPolicy<any> | FieldReadFunction<any>,
	new?: FieldPolicy<any> | FieldReadFunction<any>
};
export type AddRemoteCitationPayloadKeySpecifier = ('clientMutationId' | 'newSource' | AddRemoteCitationPayloadKeySpecifier)[];
export type AddRemoteCitationPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	newSource?: FieldPolicy<any> | FieldReadFunction<any>
};
export type AddTherapyPayloadKeySpecifier = ('clientMutationId' | 'new' | 'therapy' | AddTherapyPayloadKeySpecifier)[];
export type AddTherapyPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	new?: FieldPolicy<any> | FieldReadFunction<any>,
	therapy?: FieldPolicy<any> | FieldReadFunction<any>
};
export type AddVariantPayloadKeySpecifier = ('clientMutationId' | 'molecularProfile' | 'new' | 'variant' | AddVariantPayloadKeySpecifier)[];
export type AddVariantPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	molecularProfile?: FieldPolicy<any> | FieldReadFunction<any>,
	new?: FieldPolicy<any> | FieldReadFunction<any>,
	variant?: FieldPolicy<any> | FieldReadFunction<any>
};
export type AdvancedSearchResultKeySpecifier = ('permalinkId' | 'resultIds' | 'searchEndpoint' | AdvancedSearchResultKeySpecifier)[];
export type AdvancedSearchResultFieldPolicy = {
	permalinkId?: FieldPolicy<any> | FieldReadFunction<any>,
	resultIds?: FieldPolicy<any> | FieldReadFunction<any>,
	searchEndpoint?: FieldPolicy<any> | FieldReadFunction<any>
};
export type AssertionKeySpecifier = ('acceptanceEvent' | 'acmgCodes' | 'ampLevel' | 'assertionDirection' | 'assertionType' | 'clingenCodes' | 'comments' | 'description' | 'disease' | 'events' | 'evidenceItems' | 'evidenceItemsCount' | 'fdaCompanionTest' | 'fdaCompanionTestLastUpdated' | 'flagged' | 'flags' | 'id' | 'lastAcceptedRevisionEvent' | 'lastCommentEvent' | 'lastSubmittedRevisionEvent' | 'link' | 'molecularProfile' | 'name' | 'nccnGuideline' | 'nccnGuidelineVersion' | 'phenotypes' | 'regulatoryApproval' | 'regulatoryApprovalLastUpdated' | 'rejectionEvent' | 'revisions' | 'significance' | 'status' | 'submissionEvent' | 'summary' | 'therapies' | 'therapyInteractionType' | 'variantOrigin' | AssertionKeySpecifier)[];
export type AssertionFieldPolicy = {
	acceptanceEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	acmgCodes?: FieldPolicy<any> | FieldReadFunction<any>,
	ampLevel?: FieldPolicy<any> | FieldReadFunction<any>,
	assertionDirection?: FieldPolicy<any> | FieldReadFunction<any>,
	assertionType?: FieldPolicy<any> | FieldReadFunction<any>,
	clingenCodes?: FieldPolicy<any> | FieldReadFunction<any>,
	comments?: FieldPolicy<any> | FieldReadFunction<any>,
	description?: FieldPolicy<any> | FieldReadFunction<any>,
	disease?: FieldPolicy<any> | FieldReadFunction<any>,
	events?: FieldPolicy<any> | FieldReadFunction<any>,
	evidenceItems?: FieldPolicy<any> | FieldReadFunction<any>,
	evidenceItemsCount?: FieldPolicy<any> | FieldReadFunction<any>,
	fdaCompanionTest?: FieldPolicy<any> | FieldReadFunction<any>,
	fdaCompanionTestLastUpdated?: FieldPolicy<any> | FieldReadFunction<any>,
	flagged?: FieldPolicy<any> | FieldReadFunction<any>,
	flags?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	lastAcceptedRevisionEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	lastCommentEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	lastSubmittedRevisionEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	molecularProfile?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	nccnGuideline?: FieldPolicy<any> | FieldReadFunction<any>,
	nccnGuidelineVersion?: FieldPolicy<any> | FieldReadFunction<any>,
	phenotypes?: FieldPolicy<any> | FieldReadFunction<any>,
	regulatoryApproval?: FieldPolicy<any> | FieldReadFunction<any>,
	regulatoryApprovalLastUpdated?: FieldPolicy<any> | FieldReadFunction<any>,
	rejectionEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	revisions?: FieldPolicy<any> | FieldReadFunction<any>,
	significance?: FieldPolicy<any> | FieldReadFunction<any>,
	status?: FieldPolicy<any> | FieldReadFunction<any>,
	submissionEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	summary?: FieldPolicy<any> | FieldReadFunction<any>,
	therapies?: FieldPolicy<any> | FieldReadFunction<any>,
	therapyInteractionType?: FieldPolicy<any> | FieldReadFunction<any>,
	variantOrigin?: FieldPolicy<any> | FieldReadFunction<any>
};
export type AssertionConnectionKeySpecifier = ('edges' | 'nodes' | 'pageCount' | 'pageInfo' | 'totalCount' | AssertionConnectionKeySpecifier)[];
export type AssertionConnectionFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageCount?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type AssertionEdgeKeySpecifier = ('cursor' | 'node' | AssertionEdgeKeySpecifier)[];
export type AssertionEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowseClinicalTrialKeySpecifier = ('evidenceCount' | 'id' | 'link' | 'name' | 'nctId' | 'sourceCount' | 'url' | BrowseClinicalTrialKeySpecifier)[];
export type BrowseClinicalTrialFieldPolicy = {
	evidenceCount?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	nctId?: FieldPolicy<any> | FieldReadFunction<any>,
	sourceCount?: FieldPolicy<any> | FieldReadFunction<any>,
	url?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowseClinicalTrialConnectionKeySpecifier = ('edges' | 'filteredCount' | 'nodes' | 'pageCount' | 'pageInfo' | 'totalCount' | BrowseClinicalTrialConnectionKeySpecifier)[];
export type BrowseClinicalTrialConnectionFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	filteredCount?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageCount?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowseClinicalTrialEdgeKeySpecifier = ('cursor' | 'node' | BrowseClinicalTrialEdgeKeySpecifier)[];
export type BrowseClinicalTrialEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowseDiseaseKeySpecifier = ('assertionCount' | 'diseaseUrl' | 'displayName' | 'doid' | 'evidenceItemCount' | 'geneCount' | 'geneNames' | 'id' | 'link' | 'name' | 'variantCount' | BrowseDiseaseKeySpecifier)[];
export type BrowseDiseaseFieldPolicy = {
	assertionCount?: FieldPolicy<any> | FieldReadFunction<any>,
	diseaseUrl?: FieldPolicy<any> | FieldReadFunction<any>,
	displayName?: FieldPolicy<any> | FieldReadFunction<any>,
	doid?: FieldPolicy<any> | FieldReadFunction<any>,
	evidenceItemCount?: FieldPolicy<any> | FieldReadFunction<any>,
	geneCount?: FieldPolicy<any> | FieldReadFunction<any>,
	geneNames?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	variantCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowseDiseaseConnectionKeySpecifier = ('edges' | 'filteredCount' | 'nodes' | 'pageCount' | 'pageInfo' | 'totalCount' | BrowseDiseaseConnectionKeySpecifier)[];
export type BrowseDiseaseConnectionFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	filteredCount?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageCount?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowseDiseaseEdgeKeySpecifier = ('cursor' | 'node' | BrowseDiseaseEdgeKeySpecifier)[];
export type BrowseDiseaseEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowseGeneKeySpecifier = ('assertionCount' | 'description' | 'diseases' | 'entrezId' | 'evidenceItemCount' | 'flagged' | 'flags' | 'geneAliases' | 'id' | 'link' | 'molecularProfileCount' | 'name' | 'therapies' | 'variantCount' | BrowseGeneKeySpecifier)[];
export type BrowseGeneFieldPolicy = {
	assertionCount?: FieldPolicy<any> | FieldReadFunction<any>,
	description?: FieldPolicy<any> | FieldReadFunction<any>,
	diseases?: FieldPolicy<any> | FieldReadFunction<any>,
	entrezId?: FieldPolicy<any> | FieldReadFunction<any>,
	evidenceItemCount?: FieldPolicy<any> | FieldReadFunction<any>,
	flagged?: FieldPolicy<any> | FieldReadFunction<any>,
	flags?: FieldPolicy<any> | FieldReadFunction<any>,
	geneAliases?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	molecularProfileCount?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	therapies?: FieldPolicy<any> | FieldReadFunction<any>,
	variantCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowseGeneConnectionKeySpecifier = ('edges' | 'filteredCount' | 'nodes' | 'pageCount' | 'pageInfo' | 'totalCount' | BrowseGeneConnectionKeySpecifier)[];
export type BrowseGeneConnectionFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	filteredCount?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageCount?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowseGeneEdgeKeySpecifier = ('cursor' | 'node' | BrowseGeneEdgeKeySpecifier)[];
export type BrowseGeneEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowseMolecularProfileKeySpecifier = ('aliases' | 'assertionCount' | 'diseases' | 'evidenceItemCount' | 'genes' | 'id' | 'link' | 'molecularProfileScore' | 'name' | 'therapies' | 'variantCount' | 'variants' | BrowseMolecularProfileKeySpecifier)[];
export type BrowseMolecularProfileFieldPolicy = {
	aliases?: FieldPolicy<any> | FieldReadFunction<any>,
	assertionCount?: FieldPolicy<any> | FieldReadFunction<any>,
	diseases?: FieldPolicy<any> | FieldReadFunction<any>,
	evidenceItemCount?: FieldPolicy<any> | FieldReadFunction<any>,
	genes?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	molecularProfileScore?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	therapies?: FieldPolicy<any> | FieldReadFunction<any>,
	variantCount?: FieldPolicy<any> | FieldReadFunction<any>,
	variants?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowseMolecularProfileConnectionKeySpecifier = ('edges' | 'filteredCount' | 'nodes' | 'pageCount' | 'pageInfo' | 'totalCount' | BrowseMolecularProfileConnectionKeySpecifier)[];
export type BrowseMolecularProfileConnectionFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	filteredCount?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageCount?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowseMolecularProfileEdgeKeySpecifier = ('cursor' | 'node' | BrowseMolecularProfileEdgeKeySpecifier)[];
export type BrowseMolecularProfileEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowsePhenotypeKeySpecifier = ('assertionCount' | 'evidenceCount' | 'hpoId' | 'id' | 'link' | 'name' | 'url' | BrowsePhenotypeKeySpecifier)[];
export type BrowsePhenotypeFieldPolicy = {
	assertionCount?: FieldPolicy<any> | FieldReadFunction<any>,
	evidenceCount?: FieldPolicy<any> | FieldReadFunction<any>,
	hpoId?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	url?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowsePhenotypeConnectionKeySpecifier = ('edges' | 'filteredCount' | 'nodes' | 'pageCount' | 'pageInfo' | 'totalCount' | BrowsePhenotypeConnectionKeySpecifier)[];
export type BrowsePhenotypeConnectionFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	filteredCount?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageCount?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowsePhenotypeEdgeKeySpecifier = ('cursor' | 'node' | BrowsePhenotypeEdgeKeySpecifier)[];
export type BrowsePhenotypeEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowseSourceKeySpecifier = ('authors' | 'citation' | 'citationId' | 'clinicalTrials' | 'displayType' | 'evidenceItemCount' | 'id' | 'journal' | 'link' | 'name' | 'openAccess' | 'publicationYear' | 'sourceSuggestionCount' | 'sourceType' | 'sourceUrl' | BrowseSourceKeySpecifier)[];
export type BrowseSourceFieldPolicy = {
	authors?: FieldPolicy<any> | FieldReadFunction<any>,
	citation?: FieldPolicy<any> | FieldReadFunction<any>,
	citationId?: FieldPolicy<any> | FieldReadFunction<any>,
	clinicalTrials?: FieldPolicy<any> | FieldReadFunction<any>,
	displayType?: FieldPolicy<any> | FieldReadFunction<any>,
	evidenceItemCount?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	journal?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	openAccess?: FieldPolicy<any> | FieldReadFunction<any>,
	publicationYear?: FieldPolicy<any> | FieldReadFunction<any>,
	sourceSuggestionCount?: FieldPolicy<any> | FieldReadFunction<any>,
	sourceType?: FieldPolicy<any> | FieldReadFunction<any>,
	sourceUrl?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowseSourceConnectionKeySpecifier = ('edges' | 'filteredCount' | 'nodes' | 'pageCount' | 'pageInfo' | 'totalCount' | BrowseSourceConnectionKeySpecifier)[];
export type BrowseSourceConnectionFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	filteredCount?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageCount?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowseSourceEdgeKeySpecifier = ('cursor' | 'node' | BrowseSourceEdgeKeySpecifier)[];
export type BrowseSourceEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowseTherapyKeySpecifier = ('assertionCount' | 'evidenceCount' | 'id' | 'link' | 'name' | 'ncitId' | 'therapyUrl' | BrowseTherapyKeySpecifier)[];
export type BrowseTherapyFieldPolicy = {
	assertionCount?: FieldPolicy<any> | FieldReadFunction<any>,
	evidenceCount?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	ncitId?: FieldPolicy<any> | FieldReadFunction<any>,
	therapyUrl?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowseTherapyConnectionKeySpecifier = ('edges' | 'filteredCount' | 'nodes' | 'pageCount' | 'pageInfo' | 'totalCount' | BrowseTherapyConnectionKeySpecifier)[];
export type BrowseTherapyConnectionFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	filteredCount?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageCount?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowseTherapyEdgeKeySpecifier = ('cursor' | 'node' | BrowseTherapyEdgeKeySpecifier)[];
export type BrowseTherapyEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowseVariantKeySpecifier = ('aliases' | 'diseases' | 'geneId' | 'geneLink' | 'geneName' | 'id' | 'link' | 'name' | 'therapies' | 'variantTypes' | BrowseVariantKeySpecifier)[];
export type BrowseVariantFieldPolicy = {
	aliases?: FieldPolicy<any> | FieldReadFunction<any>,
	diseases?: FieldPolicy<any> | FieldReadFunction<any>,
	geneId?: FieldPolicy<any> | FieldReadFunction<any>,
	geneLink?: FieldPolicy<any> | FieldReadFunction<any>,
	geneName?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	therapies?: FieldPolicy<any> | FieldReadFunction<any>,
	variantTypes?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowseVariantConnectionKeySpecifier = ('edges' | 'filteredCount' | 'nodes' | 'pageCount' | 'pageInfo' | 'totalCount' | BrowseVariantConnectionKeySpecifier)[];
export type BrowseVariantConnectionFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	filteredCount?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageCount?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowseVariantEdgeKeySpecifier = ('cursor' | 'node' | BrowseVariantEdgeKeySpecifier)[];
export type BrowseVariantEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowseVariantGroupKeySpecifier = ('evidenceItemCount' | 'geneNames' | 'id' | 'link' | 'name' | 'variantCount' | 'variantNames' | BrowseVariantGroupKeySpecifier)[];
export type BrowseVariantGroupFieldPolicy = {
	evidenceItemCount?: FieldPolicy<any> | FieldReadFunction<any>,
	geneNames?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	variantCount?: FieldPolicy<any> | FieldReadFunction<any>,
	variantNames?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowseVariantGroupConnectionKeySpecifier = ('edges' | 'filteredCount' | 'nodes' | 'pageCount' | 'pageInfo' | 'totalCount' | BrowseVariantGroupConnectionKeySpecifier)[];
export type BrowseVariantGroupConnectionFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	filteredCount?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageCount?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowseVariantGroupEdgeKeySpecifier = ('cursor' | 'node' | BrowseVariantGroupEdgeKeySpecifier)[];
export type BrowseVariantGroupEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowseVariantTypeKeySpecifier = ('id' | 'link' | 'name' | 'soid' | 'url' | 'variantCount' | BrowseVariantTypeKeySpecifier)[];
export type BrowseVariantTypeFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	soid?: FieldPolicy<any> | FieldReadFunction<any>,
	url?: FieldPolicy<any> | FieldReadFunction<any>,
	variantCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowseVariantTypeConnectionKeySpecifier = ('edges' | 'filteredCount' | 'nodes' | 'pageCount' | 'pageInfo' | 'totalCount' | BrowseVariantTypeConnectionKeySpecifier)[];
export type BrowseVariantTypeConnectionFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	filteredCount?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageCount?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BrowseVariantTypeEdgeKeySpecifier = ('cursor' | 'node' | BrowseVariantTypeEdgeKeySpecifier)[];
export type BrowseVariantTypeEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type CivicTimepointStatsKeySpecifier = ('assertions' | 'comments' | 'diseases' | 'evidenceItems' | 'genes' | 'molecularProfiles' | 'revisions' | 'sources' | 'therapies' | 'users' | 'variants' | CivicTimepointStatsKeySpecifier)[];
export type CivicTimepointStatsFieldPolicy = {
	assertions?: FieldPolicy<any> | FieldReadFunction<any>,
	comments?: FieldPolicy<any> | FieldReadFunction<any>,
	diseases?: FieldPolicy<any> | FieldReadFunction<any>,
	evidenceItems?: FieldPolicy<any> | FieldReadFunction<any>,
	genes?: FieldPolicy<any> | FieldReadFunction<any>,
	molecularProfiles?: FieldPolicy<any> | FieldReadFunction<any>,
	revisions?: FieldPolicy<any> | FieldReadFunction<any>,
	sources?: FieldPolicy<any> | FieldReadFunction<any>,
	therapies?: FieldPolicy<any> | FieldReadFunction<any>,
	users?: FieldPolicy<any> | FieldReadFunction<any>,
	variants?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ClingenCodeKeySpecifier = ('code' | 'description' | 'exclusive' | 'id' | 'name' | 'tooltip' | ClingenCodeKeySpecifier)[];
export type ClingenCodeFieldPolicy = {
	code?: FieldPolicy<any> | FieldReadFunction<any>,
	description?: FieldPolicy<any> | FieldReadFunction<any>,
	exclusive?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	tooltip?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ClinicalTrialKeySpecifier = ('description' | 'id' | 'link' | 'name' | 'nctId' | 'url' | ClinicalTrialKeySpecifier)[];
export type ClinicalTrialFieldPolicy = {
	description?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	nctId?: FieldPolicy<any> | FieldReadFunction<any>,
	url?: FieldPolicy<any> | FieldReadFunction<any>
};
export type CoiKeySpecifier = ('coiPresent' | 'coiStatement' | 'coiStatus' | 'createdAt' | 'expiresAt' | 'id' | CoiKeySpecifier)[];
export type CoiFieldPolicy = {
	coiPresent?: FieldPolicy<any> | FieldReadFunction<any>,
	coiStatement?: FieldPolicy<any> | FieldReadFunction<any>,
	coiStatus?: FieldPolicy<any> | FieldReadFunction<any>,
	createdAt?: FieldPolicy<any> | FieldReadFunction<any>,
	expiresAt?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>
};
export type CommentKeySpecifier = ('comment' | 'commentable' | 'commenter' | 'createdAt' | 'creationEvent' | 'id' | 'link' | 'name' | 'parsedComment' | 'title' | CommentKeySpecifier)[];
export type CommentFieldPolicy = {
	comment?: FieldPolicy<any> | FieldReadFunction<any>,
	commentable?: FieldPolicy<any> | FieldReadFunction<any>,
	commenter?: FieldPolicy<any> | FieldReadFunction<any>,
	createdAt?: FieldPolicy<any> | FieldReadFunction<any>,
	creationEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	parsedComment?: FieldPolicy<any> | FieldReadFunction<any>,
	title?: FieldPolicy<any> | FieldReadFunction<any>
};
export type CommentConnectionKeySpecifier = ('edges' | 'mentionedEntities' | 'mentionedRoles' | 'mentionedUsers' | 'nodes' | 'pageCount' | 'pageInfo' | 'totalCount' | 'unfilteredCountForSubject' | 'uniqueCommenters' | CommentConnectionKeySpecifier)[];
export type CommentConnectionFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	mentionedEntities?: FieldPolicy<any> | FieldReadFunction<any>,
	mentionedRoles?: FieldPolicy<any> | FieldReadFunction<any>,
	mentionedUsers?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageCount?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>,
	unfilteredCountForSubject?: FieldPolicy<any> | FieldReadFunction<any>,
	uniqueCommenters?: FieldPolicy<any> | FieldReadFunction<any>
};
export type CommentEdgeKeySpecifier = ('cursor' | 'node' | CommentEdgeKeySpecifier)[];
export type CommentEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type CommentTagSegmentKeySpecifier = ('deprecated' | 'displayName' | 'entityId' | 'link' | 'revisionSetId' | 'status' | 'tagType' | CommentTagSegmentKeySpecifier)[];
export type CommentTagSegmentFieldPolicy = {
	deprecated?: FieldPolicy<any> | FieldReadFunction<any>,
	displayName?: FieldPolicy<any> | FieldReadFunction<any>,
	entityId?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	revisionSetId?: FieldPolicy<any> | FieldReadFunction<any>,
	status?: FieldPolicy<any> | FieldReadFunction<any>,
	tagType?: FieldPolicy<any> | FieldReadFunction<any>
};
export type CommentTextSegmentKeySpecifier = ('text' | CommentTextSegmentKeySpecifier)[];
export type CommentTextSegmentFieldPolicy = {
	text?: FieldPolicy<any> | FieldReadFunction<any>
};
export type CommentableKeySpecifier = ('comments' | 'id' | 'lastCommentEvent' | 'link' | 'name' | CommentableKeySpecifier)[];
export type CommentableFieldPolicy = {
	comments?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	lastCommentEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ContributingUserKeySpecifier = ('lastActionDate' | 'totalActionCount' | 'uniqueActions' | 'user' | ContributingUserKeySpecifier)[];
export type ContributingUserFieldPolicy = {
	lastActionDate?: FieldPolicy<any> | FieldReadFunction<any>,
	totalActionCount?: FieldPolicy<any> | FieldReadFunction<any>,
	uniqueActions?: FieldPolicy<any> | FieldReadFunction<any>,
	user?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ContributingUsersSummaryKeySpecifier = ('curators' | 'editors' | ContributingUsersSummaryKeySpecifier)[];
export type ContributingUsersSummaryFieldPolicy = {
	curators?: FieldPolicy<any> | FieldReadFunction<any>,
	editors?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ContributionKeySpecifier = ('action' | 'count' | ContributionKeySpecifier)[];
export type ContributionFieldPolicy = {
	action?: FieldPolicy<any> | FieldReadFunction<any>,
	count?: FieldPolicy<any> | FieldReadFunction<any>
};
export type CoordinateKeySpecifier = ('chromosome' | 'representativeTranscript' | 'start' | 'stop' | CoordinateKeySpecifier)[];
export type CoordinateFieldPolicy = {
	chromosome?: FieldPolicy<any> | FieldReadFunction<any>,
	representativeTranscript?: FieldPolicy<any> | FieldReadFunction<any>,
	start?: FieldPolicy<any> | FieldReadFunction<any>,
	stop?: FieldPolicy<any> | FieldReadFunction<any>
};
export type CountryKeySpecifier = ('id' | 'iso' | 'name' | CountryKeySpecifier)[];
export type CountryFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	iso?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type CreateMolecularProfilePayloadKeySpecifier = ('clientMutationId' | 'molecularProfile' | CreateMolecularProfilePayloadKeySpecifier)[];
export type CreateMolecularProfilePayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	molecularProfile?: FieldPolicy<any> | FieldReadFunction<any>
};
export type DataReleaseKeySpecifier = ('acceptedAndSubmittedVariantsVcf' | 'acceptedVariantsVcf' | 'assertionTsv' | 'evidenceTsv' | 'geneTsv' | 'molecularProfileTsv' | 'name' | 'variantGroupTsv' | 'variantTsv' | DataReleaseKeySpecifier)[];
export type DataReleaseFieldPolicy = {
	acceptedAndSubmittedVariantsVcf?: FieldPolicy<any> | FieldReadFunction<any>,
	acceptedVariantsVcf?: FieldPolicy<any> | FieldReadFunction<any>,
	assertionTsv?: FieldPolicy<any> | FieldReadFunction<any>,
	evidenceTsv?: FieldPolicy<any> | FieldReadFunction<any>,
	geneTsv?: FieldPolicy<any> | FieldReadFunction<any>,
	molecularProfileTsv?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	variantGroupTsv?: FieldPolicy<any> | FieldReadFunction<any>,
	variantTsv?: FieldPolicy<any> | FieldReadFunction<any>
};
export type DeprecateVariantPayloadKeySpecifier = ('clientMutationId' | 'newlyDeprecatedMolecularProfiles' | 'variant' | DeprecateVariantPayloadKeySpecifier)[];
export type DeprecateVariantPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	newlyDeprecatedMolecularProfiles?: FieldPolicy<any> | FieldReadFunction<any>,
	variant?: FieldPolicy<any> | FieldReadFunction<any>
};
export type DiseaseKeySpecifier = ('diseaseAliases' | 'diseaseUrl' | 'displayName' | 'doid' | 'id' | 'link' | 'myDiseaseInfo' | 'name' | DiseaseKeySpecifier)[];
export type DiseaseFieldPolicy = {
	diseaseAliases?: FieldPolicy<any> | FieldReadFunction<any>,
	diseaseUrl?: FieldPolicy<any> | FieldReadFunction<any>,
	displayName?: FieldPolicy<any> | FieldReadFunction<any>,
	doid?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	myDiseaseInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type DiseasePopoverKeySpecifier = ('assertionCount' | 'diseaseAliases' | 'diseaseUrl' | 'displayName' | 'doid' | 'evidenceItemCount' | 'id' | 'link' | 'molecularProfileCount' | 'myDiseaseInfo' | 'name' | DiseasePopoverKeySpecifier)[];
export type DiseasePopoverFieldPolicy = {
	assertionCount?: FieldPolicy<any> | FieldReadFunction<any>,
	diseaseAliases?: FieldPolicy<any> | FieldReadFunction<any>,
	diseaseUrl?: FieldPolicy<any> | FieldReadFunction<any>,
	displayName?: FieldPolicy<any> | FieldReadFunction<any>,
	doid?: FieldPolicy<any> | FieldReadFunction<any>,
	evidenceItemCount?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	molecularProfileCount?: FieldPolicy<any> | FieldReadFunction<any>,
	myDiseaseInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type DownloadableFileKeySpecifier = ('filename' | 'path' | DownloadableFileKeySpecifier)[];
export type DownloadableFileFieldPolicy = {
	filename?: FieldPolicy<any> | FieldReadFunction<any>,
	path?: FieldPolicy<any> | FieldReadFunction<any>
};
export type EditUserPayloadKeySpecifier = ('clientMutationId' | 'user' | EditUserPayloadKeySpecifier)[];
export type EditUserPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	user?: FieldPolicy<any> | FieldReadFunction<any>
};
export type EventKeySpecifier = ('action' | 'createdAt' | 'id' | 'organization' | 'originatingObject' | 'originatingUser' | 'subject' | EventKeySpecifier)[];
export type EventFieldPolicy = {
	action?: FieldPolicy<any> | FieldReadFunction<any>,
	createdAt?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	organization?: FieldPolicy<any> | FieldReadFunction<any>,
	originatingObject?: FieldPolicy<any> | FieldReadFunction<any>,
	originatingUser?: FieldPolicy<any> | FieldReadFunction<any>,
	subject?: FieldPolicy<any> | FieldReadFunction<any>
};
export type EventConnectionKeySpecifier = ('edges' | 'eventTypes' | 'nodes' | 'pageCount' | 'pageInfo' | 'participatingOrganizations' | 'totalCount' | 'unfilteredCount' | 'uniqueParticipants' | EventConnectionKeySpecifier)[];
export type EventConnectionFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	eventTypes?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageCount?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	participatingOrganizations?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>,
	unfilteredCount?: FieldPolicy<any> | FieldReadFunction<any>,
	uniqueParticipants?: FieldPolicy<any> | FieldReadFunction<any>
};
export type EventEdgeKeySpecifier = ('cursor' | 'node' | EventEdgeKeySpecifier)[];
export type EventEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type EventOriginObjectKeySpecifier = ('id' | 'link' | 'name' | EventOriginObjectKeySpecifier)[];
export type EventOriginObjectFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type EventSubjectKeySpecifier = ('events' | 'id' | 'link' | 'name' | EventSubjectKeySpecifier)[];
export type EventSubjectFieldPolicy = {
	events?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type EventSubjectWithCountKeySpecifier = ('occuranceCount' | 'subject' | EventSubjectWithCountKeySpecifier)[];
export type EventSubjectWithCountFieldPolicy = {
	occuranceCount?: FieldPolicy<any> | FieldReadFunction<any>,
	subject?: FieldPolicy<any> | FieldReadFunction<any>
};
export type EvidenceItemKeySpecifier = ('acceptanceEvent' | 'assertions' | 'comments' | 'description' | 'disease' | 'events' | 'evidenceDirection' | 'evidenceLevel' | 'evidenceRating' | 'evidenceType' | 'flagged' | 'flags' | 'id' | 'lastAcceptedRevisionEvent' | 'lastCommentEvent' | 'lastSubmittedRevisionEvent' | 'link' | 'molecularProfile' | 'name' | 'phenotypes' | 'rejectionEvent' | 'revisions' | 'significance' | 'source' | 'status' | 'submissionEvent' | 'therapies' | 'therapyInteractionType' | 'variantHgvs' | 'variantOrigin' | EvidenceItemKeySpecifier)[];
export type EvidenceItemFieldPolicy = {
	acceptanceEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	assertions?: FieldPolicy<any> | FieldReadFunction<any>,
	comments?: FieldPolicy<any> | FieldReadFunction<any>,
	description?: FieldPolicy<any> | FieldReadFunction<any>,
	disease?: FieldPolicy<any> | FieldReadFunction<any>,
	events?: FieldPolicy<any> | FieldReadFunction<any>,
	evidenceDirection?: FieldPolicy<any> | FieldReadFunction<any>,
	evidenceLevel?: FieldPolicy<any> | FieldReadFunction<any>,
	evidenceRating?: FieldPolicy<any> | FieldReadFunction<any>,
	evidenceType?: FieldPolicy<any> | FieldReadFunction<any>,
	flagged?: FieldPolicy<any> | FieldReadFunction<any>,
	flags?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	lastAcceptedRevisionEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	lastCommentEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	lastSubmittedRevisionEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	molecularProfile?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	phenotypes?: FieldPolicy<any> | FieldReadFunction<any>,
	rejectionEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	revisions?: FieldPolicy<any> | FieldReadFunction<any>,
	significance?: FieldPolicy<any> | FieldReadFunction<any>,
	source?: FieldPolicy<any> | FieldReadFunction<any>,
	status?: FieldPolicy<any> | FieldReadFunction<any>,
	submissionEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	therapies?: FieldPolicy<any> | FieldReadFunction<any>,
	therapyInteractionType?: FieldPolicy<any> | FieldReadFunction<any>,
	variantHgvs?: FieldPolicy<any> | FieldReadFunction<any>,
	variantOrigin?: FieldPolicy<any> | FieldReadFunction<any>
};
export type EvidenceItemConnectionKeySpecifier = ('edges' | 'nodes' | 'pageCount' | 'pageInfo' | 'totalCount' | EvidenceItemConnectionKeySpecifier)[];
export type EvidenceItemConnectionFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageCount?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type EvidenceItemEdgeKeySpecifier = ('cursor' | 'node' | EvidenceItemEdgeKeySpecifier)[];
export type EvidenceItemEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type EvidenceItemsByStatusKeySpecifier = ('acceptedCount' | 'molecularProfileId' | 'rejectedCount' | 'submittedCount' | EvidenceItemsByStatusKeySpecifier)[];
export type EvidenceItemsByStatusFieldPolicy = {
	acceptedCount?: FieldPolicy<any> | FieldReadFunction<any>,
	molecularProfileId?: FieldPolicy<any> | FieldReadFunction<any>,
	rejectedCount?: FieldPolicy<any> | FieldReadFunction<any>,
	submittedCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type FdaCodeKeySpecifier = ('code' | 'description' | FdaCodeKeySpecifier)[];
export type FdaCodeFieldPolicy = {
	code?: FieldPolicy<any> | FieldReadFunction<any>,
	description?: FieldPolicy<any> | FieldReadFunction<any>
};
export type FieldNameKeySpecifier = ('displayName' | 'name' | FieldNameKeySpecifier)[];
export type FieldNameFieldPolicy = {
	displayName?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type FieldValidationErrorKeySpecifier = ('error' | 'fieldName' | FieldValidationErrorKeySpecifier)[];
export type FieldValidationErrorFieldPolicy = {
	error?: FieldPolicy<any> | FieldReadFunction<any>,
	fieldName?: FieldPolicy<any> | FieldReadFunction<any>
};
export type FlagKeySpecifier = ('comments' | 'createdAt' | 'flaggable' | 'flaggingUser' | 'id' | 'lastCommentEvent' | 'link' | 'name' | 'openComment' | 'resolutionComment' | 'resolvedAt' | 'resolvingUser' | 'state' | FlagKeySpecifier)[];
export type FlagFieldPolicy = {
	comments?: FieldPolicy<any> | FieldReadFunction<any>,
	createdAt?: FieldPolicy<any> | FieldReadFunction<any>,
	flaggable?: FieldPolicy<any> | FieldReadFunction<any>,
	flaggingUser?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	lastCommentEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	openComment?: FieldPolicy<any> | FieldReadFunction<any>,
	resolutionComment?: FieldPolicy<any> | FieldReadFunction<any>,
	resolvedAt?: FieldPolicy<any> | FieldReadFunction<any>,
	resolvingUser?: FieldPolicy<any> | FieldReadFunction<any>,
	state?: FieldPolicy<any> | FieldReadFunction<any>
};
export type FlagConnectionKeySpecifier = ('edges' | 'nodes' | 'pageCount' | 'pageInfo' | 'totalCount' | 'unfilteredCountForSubject' | 'uniqueFlaggingUsers' | 'uniqueResolvingUsers' | FlagConnectionKeySpecifier)[];
export type FlagConnectionFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageCount?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>,
	unfilteredCountForSubject?: FieldPolicy<any> | FieldReadFunction<any>,
	uniqueFlaggingUsers?: FieldPolicy<any> | FieldReadFunction<any>,
	uniqueResolvingUsers?: FieldPolicy<any> | FieldReadFunction<any>
};
export type FlagEdgeKeySpecifier = ('cursor' | 'node' | FlagEdgeKeySpecifier)[];
export type FlagEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type FlagEntityPayloadKeySpecifier = ('clientMutationId' | 'flag' | FlagEntityPayloadKeySpecifier)[];
export type FlagEntityPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	flag?: FieldPolicy<any> | FieldReadFunction<any>
};
export type FlaggableKeySpecifier = ('flagged' | 'flags' | 'id' | 'link' | 'name' | FlaggableKeySpecifier)[];
export type FlaggableFieldPolicy = {
	flagged?: FieldPolicy<any> | FieldReadFunction<any>,
	flags?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type GeneKeySpecifier = ('comments' | 'description' | 'entrezId' | 'events' | 'flagged' | 'flags' | 'geneAliases' | 'id' | 'lastAcceptedRevisionEvent' | 'lastCommentEvent' | 'lastSubmittedRevisionEvent' | 'link' | 'myGeneInfoDetails' | 'name' | 'officialName' | 'revisions' | 'sources' | 'variants' | GeneKeySpecifier)[];
export type GeneFieldPolicy = {
	comments?: FieldPolicy<any> | FieldReadFunction<any>,
	description?: FieldPolicy<any> | FieldReadFunction<any>,
	entrezId?: FieldPolicy<any> | FieldReadFunction<any>,
	events?: FieldPolicy<any> | FieldReadFunction<any>,
	flagged?: FieldPolicy<any> | FieldReadFunction<any>,
	flags?: FieldPolicy<any> | FieldReadFunction<any>,
	geneAliases?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	lastAcceptedRevisionEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	lastCommentEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	lastSubmittedRevisionEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	myGeneInfoDetails?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	officialName?: FieldPolicy<any> | FieldReadFunction<any>,
	revisions?: FieldPolicy<any> | FieldReadFunction<any>,
	sources?: FieldPolicy<any> | FieldReadFunction<any>,
	variants?: FieldPolicy<any> | FieldReadFunction<any>
};
export type GeneConnectionKeySpecifier = ('edges' | 'nodes' | 'pageCount' | 'pageInfo' | 'totalCount' | GeneConnectionKeySpecifier)[];
export type GeneConnectionFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageCount?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type GeneEdgeKeySpecifier = ('cursor' | 'node' | GeneEdgeKeySpecifier)[];
export type GeneEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type LinkableDiseaseKeySpecifier = ('id' | 'link' | 'name' | LinkableDiseaseKeySpecifier)[];
export type LinkableDiseaseFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type LinkableGeneKeySpecifier = ('id' | 'link' | 'name' | LinkableGeneKeySpecifier)[];
export type LinkableGeneFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type LinkableTherapyKeySpecifier = ('id' | 'link' | 'name' | LinkableTherapyKeySpecifier)[];
export type LinkableTherapyFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type LinkableVariantKeySpecifier = ('id' | 'link' | 'name' | LinkableVariantKeySpecifier)[];
export type LinkableVariantFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type LinkableVariantTypeKeySpecifier = ('id' | 'link' | 'name' | LinkableVariantTypeKeySpecifier)[];
export type LinkableVariantTypeFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type LinkoutDataKeySpecifier = ('currentValue' | 'diffValue' | 'name' | 'suggestedValue' | LinkoutDataKeySpecifier)[];
export type LinkoutDataFieldPolicy = {
	currentValue?: FieldPolicy<any> | FieldReadFunction<any>,
	diffValue?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	suggestedValue?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ModerateAssertionPayloadKeySpecifier = ('assertion' | 'clientMutationId' | ModerateAssertionPayloadKeySpecifier)[];
export type ModerateAssertionPayloadFieldPolicy = {
	assertion?: FieldPolicy<any> | FieldReadFunction<any>,
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ModerateEvidenceItemPayloadKeySpecifier = ('clientMutationId' | 'evidenceItem' | ModerateEvidenceItemPayloadKeySpecifier)[];
export type ModerateEvidenceItemPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	evidenceItem?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ModeratedObjectFieldKeySpecifier = ('deleted' | 'displayName' | 'displayType' | 'entityType' | 'id' | 'link' | ModeratedObjectFieldKeySpecifier)[];
export type ModeratedObjectFieldFieldPolicy = {
	deleted?: FieldPolicy<any> | FieldReadFunction<any>,
	displayName?: FieldPolicy<any> | FieldReadFunction<any>,
	displayType?: FieldPolicy<any> | FieldReadFunction<any>,
	entityType?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MolecularProfileKeySpecifier = ('assertions' | 'comments' | 'deprecated' | 'deprecatedVariants' | 'deprecationEvent' | 'description' | 'events' | 'evidenceCountsByStatus' | 'evidenceItems' | 'flagged' | 'flags' | 'id' | 'lastAcceptedRevisionEvent' | 'lastCommentEvent' | 'lastSubmittedRevisionEvent' | 'link' | 'molecularProfileAliases' | 'molecularProfileScore' | 'name' | 'parsedName' | 'rawName' | 'revisions' | 'sources' | 'variants' | MolecularProfileKeySpecifier)[];
export type MolecularProfileFieldPolicy = {
	assertions?: FieldPolicy<any> | FieldReadFunction<any>,
	comments?: FieldPolicy<any> | FieldReadFunction<any>,
	deprecated?: FieldPolicy<any> | FieldReadFunction<any>,
	deprecatedVariants?: FieldPolicy<any> | FieldReadFunction<any>,
	deprecationEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	description?: FieldPolicy<any> | FieldReadFunction<any>,
	events?: FieldPolicy<any> | FieldReadFunction<any>,
	evidenceCountsByStatus?: FieldPolicy<any> | FieldReadFunction<any>,
	evidenceItems?: FieldPolicy<any> | FieldReadFunction<any>,
	flagged?: FieldPolicy<any> | FieldReadFunction<any>,
	flags?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	lastAcceptedRevisionEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	lastCommentEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	lastSubmittedRevisionEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	molecularProfileAliases?: FieldPolicy<any> | FieldReadFunction<any>,
	molecularProfileScore?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	parsedName?: FieldPolicy<any> | FieldReadFunction<any>,
	rawName?: FieldPolicy<any> | FieldReadFunction<any>,
	revisions?: FieldPolicy<any> | FieldReadFunction<any>,
	sources?: FieldPolicy<any> | FieldReadFunction<any>,
	variants?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MolecularProfileAliasKeySpecifier = ('name' | MolecularProfileAliasKeySpecifier)[];
export type MolecularProfileAliasFieldPolicy = {
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MolecularProfileComponentKeySpecifier = ('id' | 'link' | 'name' | MolecularProfileComponentKeySpecifier)[];
export type MolecularProfileComponentFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MolecularProfileConnectionKeySpecifier = ('edges' | 'nodes' | 'pageCount' | 'pageInfo' | 'totalCount' | MolecularProfileConnectionKeySpecifier)[];
export type MolecularProfileConnectionFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageCount?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MolecularProfileEdgeKeySpecifier = ('cursor' | 'node' | MolecularProfileEdgeKeySpecifier)[];
export type MolecularProfileEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MolecularProfileNamePreviewKeySpecifier = ('deprecatedVariants' | 'existingMolecularProfile' | 'segments' | MolecularProfileNamePreviewKeySpecifier)[];
export type MolecularProfileNamePreviewFieldPolicy = {
	deprecatedVariants?: FieldPolicy<any> | FieldReadFunction<any>,
	existingMolecularProfile?: FieldPolicy<any> | FieldReadFunction<any>,
	segments?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MolecularProfileTextSegmentKeySpecifier = ('text' | MolecularProfileTextSegmentKeySpecifier)[];
export type MolecularProfileTextSegmentFieldPolicy = {
	text?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MutationKeySpecifier = ('acceptRevisions' | 'addComment' | 'addDisease' | 'addRemoteCitation' | 'addTherapy' | 'addVariant' | 'createMolecularProfile' | 'deprecateVariant' | 'editUser' | 'flagEntity' | 'moderateAssertion' | 'moderateEvidenceItem' | 'rejectRevisions' | 'resolveFlag' | 'submitAssertion' | 'submitEvidence' | 'submitVariantGroup' | 'subscribe' | 'suggestAssertionRevision' | 'suggestEvidenceItemRevision' | 'suggestGeneRevision' | 'suggestMolecularProfileRevision' | 'suggestSource' | 'suggestVariantGroupRevision' | 'suggestVariantRevision' | 'unsubscribe' | 'updateCoi' | 'updateNotificationStatus' | 'updateSourceSuggestionStatus' | MutationKeySpecifier)[];
export type MutationFieldPolicy = {
	acceptRevisions?: FieldPolicy<any> | FieldReadFunction<any>,
	addComment?: FieldPolicy<any> | FieldReadFunction<any>,
	addDisease?: FieldPolicy<any> | FieldReadFunction<any>,
	addRemoteCitation?: FieldPolicy<any> | FieldReadFunction<any>,
	addTherapy?: FieldPolicy<any> | FieldReadFunction<any>,
	addVariant?: FieldPolicy<any> | FieldReadFunction<any>,
	createMolecularProfile?: FieldPolicy<any> | FieldReadFunction<any>,
	deprecateVariant?: FieldPolicy<any> | FieldReadFunction<any>,
	editUser?: FieldPolicy<any> | FieldReadFunction<any>,
	flagEntity?: FieldPolicy<any> | FieldReadFunction<any>,
	moderateAssertion?: FieldPolicy<any> | FieldReadFunction<any>,
	moderateEvidenceItem?: FieldPolicy<any> | FieldReadFunction<any>,
	rejectRevisions?: FieldPolicy<any> | FieldReadFunction<any>,
	resolveFlag?: FieldPolicy<any> | FieldReadFunction<any>,
	submitAssertion?: FieldPolicy<any> | FieldReadFunction<any>,
	submitEvidence?: FieldPolicy<any> | FieldReadFunction<any>,
	submitVariantGroup?: FieldPolicy<any> | FieldReadFunction<any>,
	subscribe?: FieldPolicy<any> | FieldReadFunction<any>,
	suggestAssertionRevision?: FieldPolicy<any> | FieldReadFunction<any>,
	suggestEvidenceItemRevision?: FieldPolicy<any> | FieldReadFunction<any>,
	suggestGeneRevision?: FieldPolicy<any> | FieldReadFunction<any>,
	suggestMolecularProfileRevision?: FieldPolicy<any> | FieldReadFunction<any>,
	suggestSource?: FieldPolicy<any> | FieldReadFunction<any>,
	suggestVariantGroupRevision?: FieldPolicy<any> | FieldReadFunction<any>,
	suggestVariantRevision?: FieldPolicy<any> | FieldReadFunction<any>,
	unsubscribe?: FieldPolicy<any> | FieldReadFunction<any>,
	updateCoi?: FieldPolicy<any> | FieldReadFunction<any>,
	updateNotificationStatus?: FieldPolicy<any> | FieldReadFunction<any>,
	updateSourceSuggestionStatus?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MyChemInfoKeySpecifier = ('chebiDefinition' | 'chebiId' | 'chemblId' | 'chemblMoleculeType' | 'drugbankId' | 'fdaEpcCodes' | 'fdaMoaCodes' | 'firstApproval' | 'inchikey' | 'indications' | 'pharmgkbId' | 'pubchemCid' | 'rxnorm' | MyChemInfoKeySpecifier)[];
export type MyChemInfoFieldPolicy = {
	chebiDefinition?: FieldPolicy<any> | FieldReadFunction<any>,
	chebiId?: FieldPolicy<any> | FieldReadFunction<any>,
	chemblId?: FieldPolicy<any> | FieldReadFunction<any>,
	chemblMoleculeType?: FieldPolicy<any> | FieldReadFunction<any>,
	drugbankId?: FieldPolicy<any> | FieldReadFunction<any>,
	fdaEpcCodes?: FieldPolicy<any> | FieldReadFunction<any>,
	fdaMoaCodes?: FieldPolicy<any> | FieldReadFunction<any>,
	firstApproval?: FieldPolicy<any> | FieldReadFunction<any>,
	inchikey?: FieldPolicy<any> | FieldReadFunction<any>,
	indications?: FieldPolicy<any> | FieldReadFunction<any>,
	pharmgkbId?: FieldPolicy<any> | FieldReadFunction<any>,
	pubchemCid?: FieldPolicy<any> | FieldReadFunction<any>,
	rxnorm?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MyDiseaseInfoKeySpecifier = ('diseaseOntologyExactSynonyms' | 'diseaseOntologyRelatedSynonyms' | 'doDef' | 'doDefCitations' | 'icd10' | 'icdo' | 'mesh' | 'mondoDef' | 'ncit' | 'omim' | MyDiseaseInfoKeySpecifier)[];
export type MyDiseaseInfoFieldPolicy = {
	diseaseOntologyExactSynonyms?: FieldPolicy<any> | FieldReadFunction<any>,
	diseaseOntologyRelatedSynonyms?: FieldPolicy<any> | FieldReadFunction<any>,
	doDef?: FieldPolicy<any> | FieldReadFunction<any>,
	doDefCitations?: FieldPolicy<any> | FieldReadFunction<any>,
	icd10?: FieldPolicy<any> | FieldReadFunction<any>,
	icdo?: FieldPolicy<any> | FieldReadFunction<any>,
	mesh?: FieldPolicy<any> | FieldReadFunction<any>,
	mondoDef?: FieldPolicy<any> | FieldReadFunction<any>,
	ncit?: FieldPolicy<any> | FieldReadFunction<any>,
	omim?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MyVariantInfoKeySpecifier = ('caddConsequence' | 'caddDetail' | 'caddPhred' | 'caddScore' | 'clinvarClinicalSignificance' | 'clinvarHgvsCoding' | 'clinvarHgvsGenomic' | 'clinvarHgvsNonCoding' | 'clinvarHgvsProtein' | 'clinvarId' | 'clinvarOmim' | 'cosmicId' | 'dbnsfpInterproDomain' | 'dbsnpRsid' | 'eglClass' | 'eglHgvs' | 'eglProtein' | 'eglTranscript' | 'exacAlleleCount' | 'exacAlleleFrequency' | 'exacAlleleNumber' | 'fathmmMklPrediction' | 'fathmmMklScore' | 'fathmmPrediction' | 'fathmmScore' | 'fitconsScore' | 'gerp' | 'gnomadExomeAlleleCount' | 'gnomadExomeAlleleFrequency' | 'gnomadExomeAlleleNumber' | 'gnomadExomeFilter' | 'gnomadGenomeAlleleCount' | 'gnomadGenomeAlleleFrequency' | 'gnomadGenomeAlleleNumber' | 'gnomadGenomeFilter' | 'lrtPrediction' | 'lrtScore' | 'metalrPrediction' | 'metalrScore' | 'metasvmPrediction' | 'metasvmScore' | 'mutationassessorPrediction' | 'mutationassessorScore' | 'mutationtasterPrediction' | 'mutationtasterScore' | 'myVariantInfoId' | 'phastcons30way' | 'phastcons100way' | 'phyloP30way' | 'phyloP100way' | 'polyphen2HdivPrediction' | 'polyphen2HdivScore' | 'polyphen2HvarPrediction' | 'polyphen2HvarScore' | 'proveanPrediction' | 'proveanScore' | 'revelScore' | 'siftPrediction' | 'siftScore' | 'siphy' | 'snpeffSnpEffect' | 'snpeffSnpImpact' | MyVariantInfoKeySpecifier)[];
export type MyVariantInfoFieldPolicy = {
	caddConsequence?: FieldPolicy<any> | FieldReadFunction<any>,
	caddDetail?: FieldPolicy<any> | FieldReadFunction<any>,
	caddPhred?: FieldPolicy<any> | FieldReadFunction<any>,
	caddScore?: FieldPolicy<any> | FieldReadFunction<any>,
	clinvarClinicalSignificance?: FieldPolicy<any> | FieldReadFunction<any>,
	clinvarHgvsCoding?: FieldPolicy<any> | FieldReadFunction<any>,
	clinvarHgvsGenomic?: FieldPolicy<any> | FieldReadFunction<any>,
	clinvarHgvsNonCoding?: FieldPolicy<any> | FieldReadFunction<any>,
	clinvarHgvsProtein?: FieldPolicy<any> | FieldReadFunction<any>,
	clinvarId?: FieldPolicy<any> | FieldReadFunction<any>,
	clinvarOmim?: FieldPolicy<any> | FieldReadFunction<any>,
	cosmicId?: FieldPolicy<any> | FieldReadFunction<any>,
	dbnsfpInterproDomain?: FieldPolicy<any> | FieldReadFunction<any>,
	dbsnpRsid?: FieldPolicy<any> | FieldReadFunction<any>,
	eglClass?: FieldPolicy<any> | FieldReadFunction<any>,
	eglHgvs?: FieldPolicy<any> | FieldReadFunction<any>,
	eglProtein?: FieldPolicy<any> | FieldReadFunction<any>,
	eglTranscript?: FieldPolicy<any> | FieldReadFunction<any>,
	exacAlleleCount?: FieldPolicy<any> | FieldReadFunction<any>,
	exacAlleleFrequency?: FieldPolicy<any> | FieldReadFunction<any>,
	exacAlleleNumber?: FieldPolicy<any> | FieldReadFunction<any>,
	fathmmMklPrediction?: FieldPolicy<any> | FieldReadFunction<any>,
	fathmmMklScore?: FieldPolicy<any> | FieldReadFunction<any>,
	fathmmPrediction?: FieldPolicy<any> | FieldReadFunction<any>,
	fathmmScore?: FieldPolicy<any> | FieldReadFunction<any>,
	fitconsScore?: FieldPolicy<any> | FieldReadFunction<any>,
	gerp?: FieldPolicy<any> | FieldReadFunction<any>,
	gnomadExomeAlleleCount?: FieldPolicy<any> | FieldReadFunction<any>,
	gnomadExomeAlleleFrequency?: FieldPolicy<any> | FieldReadFunction<any>,
	gnomadExomeAlleleNumber?: FieldPolicy<any> | FieldReadFunction<any>,
	gnomadExomeFilter?: FieldPolicy<any> | FieldReadFunction<any>,
	gnomadGenomeAlleleCount?: FieldPolicy<any> | FieldReadFunction<any>,
	gnomadGenomeAlleleFrequency?: FieldPolicy<any> | FieldReadFunction<any>,
	gnomadGenomeAlleleNumber?: FieldPolicy<any> | FieldReadFunction<any>,
	gnomadGenomeFilter?: FieldPolicy<any> | FieldReadFunction<any>,
	lrtPrediction?: FieldPolicy<any> | FieldReadFunction<any>,
	lrtScore?: FieldPolicy<any> | FieldReadFunction<any>,
	metalrPrediction?: FieldPolicy<any> | FieldReadFunction<any>,
	metalrScore?: FieldPolicy<any> | FieldReadFunction<any>,
	metasvmPrediction?: FieldPolicy<any> | FieldReadFunction<any>,
	metasvmScore?: FieldPolicy<any> | FieldReadFunction<any>,
	mutationassessorPrediction?: FieldPolicy<any> | FieldReadFunction<any>,
	mutationassessorScore?: FieldPolicy<any> | FieldReadFunction<any>,
	mutationtasterPrediction?: FieldPolicy<any> | FieldReadFunction<any>,
	mutationtasterScore?: FieldPolicy<any> | FieldReadFunction<any>,
	myVariantInfoId?: FieldPolicy<any> | FieldReadFunction<any>,
	phastcons30way?: FieldPolicy<any> | FieldReadFunction<any>,
	phastcons100way?: FieldPolicy<any> | FieldReadFunction<any>,
	phyloP30way?: FieldPolicy<any> | FieldReadFunction<any>,
	phyloP100way?: FieldPolicy<any> | FieldReadFunction<any>,
	polyphen2HdivPrediction?: FieldPolicy<any> | FieldReadFunction<any>,
	polyphen2HdivScore?: FieldPolicy<any> | FieldReadFunction<any>,
	polyphen2HvarPrediction?: FieldPolicy<any> | FieldReadFunction<any>,
	polyphen2HvarScore?: FieldPolicy<any> | FieldReadFunction<any>,
	proveanPrediction?: FieldPolicy<any> | FieldReadFunction<any>,
	proveanScore?: FieldPolicy<any> | FieldReadFunction<any>,
	revelScore?: FieldPolicy<any> | FieldReadFunction<any>,
	siftPrediction?: FieldPolicy<any> | FieldReadFunction<any>,
	siftScore?: FieldPolicy<any> | FieldReadFunction<any>,
	siphy?: FieldPolicy<any> | FieldReadFunction<any>,
	snpeffSnpEffect?: FieldPolicy<any> | FieldReadFunction<any>,
	snpeffSnpImpact?: FieldPolicy<any> | FieldReadFunction<any>
};
export type NccnGuidelineKeySpecifier = ('id' | 'name' | NccnGuidelineKeySpecifier)[];
export type NccnGuidelineFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type NotificationKeySpecifier = ('createdAt' | 'event' | 'id' | 'notifiedUser' | 'originatingUser' | 'seen' | 'subscription' | 'type' | 'updatedAt' | NotificationKeySpecifier)[];
export type NotificationFieldPolicy = {
	createdAt?: FieldPolicy<any> | FieldReadFunction<any>,
	event?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	notifiedUser?: FieldPolicy<any> | FieldReadFunction<any>,
	originatingUser?: FieldPolicy<any> | FieldReadFunction<any>,
	seen?: FieldPolicy<any> | FieldReadFunction<any>,
	subscription?: FieldPolicy<any> | FieldReadFunction<any>,
	type?: FieldPolicy<any> | FieldReadFunction<any>,
	updatedAt?: FieldPolicy<any> | FieldReadFunction<any>
};
export type NotificationConnectionKeySpecifier = ('edges' | 'eventTypes' | 'mentioningUsers' | 'nodes' | 'notificationSubjects' | 'organizations' | 'originatingUsers' | 'pageCount' | 'pageInfo' | 'totalCount' | 'unreadCount' | NotificationConnectionKeySpecifier)[];
export type NotificationConnectionFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	eventTypes?: FieldPolicy<any> | FieldReadFunction<any>,
	mentioningUsers?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	notificationSubjects?: FieldPolicy<any> | FieldReadFunction<any>,
	organizations?: FieldPolicy<any> | FieldReadFunction<any>,
	originatingUsers?: FieldPolicy<any> | FieldReadFunction<any>,
	pageCount?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>,
	unreadCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type NotificationEdgeKeySpecifier = ('cursor' | 'node' | NotificationEdgeKeySpecifier)[];
export type NotificationEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ObjectFieldKeySpecifier = ('objects' | ObjectFieldKeySpecifier)[];
export type ObjectFieldFieldPolicy = {
	objects?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ObjectFieldDiffKeySpecifier = ('addedObjects' | 'currentObjects' | 'keptObjects' | 'removedObjects' | 'suggestedObjects' | ObjectFieldDiffKeySpecifier)[];
export type ObjectFieldDiffFieldPolicy = {
	addedObjects?: FieldPolicy<any> | FieldReadFunction<any>,
	currentObjects?: FieldPolicy<any> | FieldReadFunction<any>,
	keptObjects?: FieldPolicy<any> | FieldReadFunction<any>,
	removedObjects?: FieldPolicy<any> | FieldReadFunction<any>,
	suggestedObjects?: FieldPolicy<any> | FieldReadFunction<any>
};
export type OrganizationKeySpecifier = ('description' | 'eventCount' | 'events' | 'id' | 'memberCount' | 'members' | 'mostRecentEvent' | 'name' | 'orgAndSuborgsStatsHash' | 'orgStatsHash' | 'profileImagePath' | 'subGroups' | 'url' | OrganizationKeySpecifier)[];
export type OrganizationFieldPolicy = {
	description?: FieldPolicy<any> | FieldReadFunction<any>,
	eventCount?: FieldPolicy<any> | FieldReadFunction<any>,
	events?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	memberCount?: FieldPolicy<any> | FieldReadFunction<any>,
	members?: FieldPolicy<any> | FieldReadFunction<any>,
	mostRecentEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	orgAndSuborgsStatsHash?: FieldPolicy<any> | FieldReadFunction<any>,
	orgStatsHash?: FieldPolicy<any> | FieldReadFunction<any>,
	profileImagePath?: FieldPolicy<any> | FieldReadFunction<any>,
	subGroups?: FieldPolicy<any> | FieldReadFunction<any>,
	url?: FieldPolicy<any> | FieldReadFunction<any>
};
export type OrganizationConnectionKeySpecifier = ('edges' | 'nodes' | 'pageCount' | 'pageInfo' | 'totalCount' | OrganizationConnectionKeySpecifier)[];
export type OrganizationConnectionFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageCount?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type OrganizationEdgeKeySpecifier = ('cursor' | 'node' | OrganizationEdgeKeySpecifier)[];
export type OrganizationEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type PageInfoKeySpecifier = ('endCursor' | 'hasNextPage' | 'hasPreviousPage' | 'startCursor' | PageInfoKeySpecifier)[];
export type PageInfoFieldPolicy = {
	endCursor?: FieldPolicy<any> | FieldReadFunction<any>,
	hasNextPage?: FieldPolicy<any> | FieldReadFunction<any>,
	hasPreviousPage?: FieldPolicy<any> | FieldReadFunction<any>,
	startCursor?: FieldPolicy<any> | FieldReadFunction<any>
};
export type PhenotypeKeySpecifier = ('description' | 'hpoId' | 'id' | 'link' | 'name' | 'url' | PhenotypeKeySpecifier)[];
export type PhenotypeFieldPolicy = {
	description?: FieldPolicy<any> | FieldReadFunction<any>,
	hpoId?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	url?: FieldPolicy<any> | FieldReadFunction<any>
};
export type PhenotypePopoverKeySpecifier = ('assertionCount' | 'description' | 'evidenceItemCount' | 'hpoId' | 'id' | 'link' | 'molecularProfileCount' | 'name' | 'url' | PhenotypePopoverKeySpecifier)[];
export type PhenotypePopoverFieldPolicy = {
	assertionCount?: FieldPolicy<any> | FieldReadFunction<any>,
	description?: FieldPolicy<any> | FieldReadFunction<any>,
	evidenceItemCount?: FieldPolicy<any> | FieldReadFunction<any>,
	hpoId?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	molecularProfileCount?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	url?: FieldPolicy<any> | FieldReadFunction<any>
};
export type QueryKeySpecifier = ('acmgCode' | 'acmgCodesTypeahead' | 'assertion' | 'assertions' | 'browseDiseases' | 'browseGenes' | 'browseMolecularProfiles' | 'browseSources' | 'browseVariantGroups' | 'browseVariants' | 'clingenCode' | 'clingenCodesTypeahead' | 'clinicalTrial' | 'clinicalTrials' | 'comment' | 'comments' | 'contributors' | 'countries' | 'dataReleases' | 'disease' | 'diseasePopover' | 'diseaseTypeahead' | 'entityTypeahead' | 'events' | 'evidenceItem' | 'evidenceItems' | 'flag' | 'flags' | 'gene' | 'geneTypeahead' | 'genes' | 'molecularProfile' | 'molecularProfiles' | 'nccnGuideline' | 'nccnGuidelinesTypeahead' | 'notifications' | 'organization' | 'organizations' | 'phenotype' | 'phenotypePopover' | 'phenotypeTypeahead' | 'phenotypes' | 'previewCommentText' | 'previewMolecularProfileName' | 'remoteCitation' | 'revision' | 'revisions' | 'search' | 'searchByPermalink' | 'searchGenes' | 'source' | 'sourcePopover' | 'sourceSuggestionValues' | 'sourceSuggestions' | 'sourceTypeahead' | 'subscriptionForEntity' | 'therapies' | 'therapy' | 'therapyPopover' | 'therapyTypeahead' | 'timepointStats' | 'user' | 'userTypeahead' | 'users' | 'validateRevisionsForAcceptance' | 'variant' | 'variantGroup' | 'variantGroups' | 'variantType' | 'variantTypePopover' | 'variantTypeTypeahead' | 'variantTypes' | 'variants' | 'viewer' | QueryKeySpecifier)[];
export type QueryFieldPolicy = {
	acmgCode?: FieldPolicy<any> | FieldReadFunction<any>,
	acmgCodesTypeahead?: FieldPolicy<any> | FieldReadFunction<any>,
	assertion?: FieldPolicy<any> | FieldReadFunction<any>,
	assertions?: FieldPolicy<any> | FieldReadFunction<any>,
	browseDiseases?: FieldPolicy<any> | FieldReadFunction<any>,
	browseGenes?: FieldPolicy<any> | FieldReadFunction<any>,
	browseMolecularProfiles?: FieldPolicy<any> | FieldReadFunction<any>,
	browseSources?: FieldPolicy<any> | FieldReadFunction<any>,
	browseVariantGroups?: FieldPolicy<any> | FieldReadFunction<any>,
	browseVariants?: FieldPolicy<any> | FieldReadFunction<any>,
	clingenCode?: FieldPolicy<any> | FieldReadFunction<any>,
	clingenCodesTypeahead?: FieldPolicy<any> | FieldReadFunction<any>,
	clinicalTrial?: FieldPolicy<any> | FieldReadFunction<any>,
	clinicalTrials?: FieldPolicy<any> | FieldReadFunction<any>,
	comment?: FieldPolicy<any> | FieldReadFunction<any>,
	comments?: FieldPolicy<any> | FieldReadFunction<any>,
	contributors?: FieldPolicy<any> | FieldReadFunction<any>,
	countries?: FieldPolicy<any> | FieldReadFunction<any>,
	dataReleases?: FieldPolicy<any> | FieldReadFunction<any>,
	disease?: FieldPolicy<any> | FieldReadFunction<any>,
	diseasePopover?: FieldPolicy<any> | FieldReadFunction<any>,
	diseaseTypeahead?: FieldPolicy<any> | FieldReadFunction<any>,
	entityTypeahead?: FieldPolicy<any> | FieldReadFunction<any>,
	events?: FieldPolicy<any> | FieldReadFunction<any>,
	evidenceItem?: FieldPolicy<any> | FieldReadFunction<any>,
	evidenceItems?: FieldPolicy<any> | FieldReadFunction<any>,
	flag?: FieldPolicy<any> | FieldReadFunction<any>,
	flags?: FieldPolicy<any> | FieldReadFunction<any>,
	gene?: FieldPolicy<any> | FieldReadFunction<any>,
	geneTypeahead?: FieldPolicy<any> | FieldReadFunction<any>,
	genes?: FieldPolicy<any> | FieldReadFunction<any>,
	molecularProfile?: FieldPolicy<any> | FieldReadFunction<any>,
	molecularProfiles?: FieldPolicy<any> | FieldReadFunction<any>,
	nccnGuideline?: FieldPolicy<any> | FieldReadFunction<any>,
	nccnGuidelinesTypeahead?: FieldPolicy<any> | FieldReadFunction<any>,
	notifications?: FieldPolicy<any> | FieldReadFunction<any>,
	organization?: FieldPolicy<any> | FieldReadFunction<any>,
	organizations?: FieldPolicy<any> | FieldReadFunction<any>,
	phenotype?: FieldPolicy<any> | FieldReadFunction<any>,
	phenotypePopover?: FieldPolicy<any> | FieldReadFunction<any>,
	phenotypeTypeahead?: FieldPolicy<any> | FieldReadFunction<any>,
	phenotypes?: FieldPolicy<any> | FieldReadFunction<any>,
	previewCommentText?: FieldPolicy<any> | FieldReadFunction<any>,
	previewMolecularProfileName?: FieldPolicy<any> | FieldReadFunction<any>,
	remoteCitation?: FieldPolicy<any> | FieldReadFunction<any>,
	revision?: FieldPolicy<any> | FieldReadFunction<any>,
	revisions?: FieldPolicy<any> | FieldReadFunction<any>,
	search?: FieldPolicy<any> | FieldReadFunction<any>,
	searchByPermalink?: FieldPolicy<any> | FieldReadFunction<any>,
	searchGenes?: FieldPolicy<any> | FieldReadFunction<any>,
	source?: FieldPolicy<any> | FieldReadFunction<any>,
	sourcePopover?: FieldPolicy<any> | FieldReadFunction<any>,
	sourceSuggestionValues?: FieldPolicy<any> | FieldReadFunction<any>,
	sourceSuggestions?: FieldPolicy<any> | FieldReadFunction<any>,
	sourceTypeahead?: FieldPolicy<any> | FieldReadFunction<any>,
	subscriptionForEntity?: FieldPolicy<any> | FieldReadFunction<any>,
	therapies?: FieldPolicy<any> | FieldReadFunction<any>,
	therapy?: FieldPolicy<any> | FieldReadFunction<any>,
	therapyPopover?: FieldPolicy<any> | FieldReadFunction<any>,
	therapyTypeahead?: FieldPolicy<any> | FieldReadFunction<any>,
	timepointStats?: FieldPolicy<any> | FieldReadFunction<any>,
	user?: FieldPolicy<any> | FieldReadFunction<any>,
	userTypeahead?: FieldPolicy<any> | FieldReadFunction<any>,
	users?: FieldPolicy<any> | FieldReadFunction<any>,
	validateRevisionsForAcceptance?: FieldPolicy<any> | FieldReadFunction<any>,
	variant?: FieldPolicy<any> | FieldReadFunction<any>,
	variantGroup?: FieldPolicy<any> | FieldReadFunction<any>,
	variantGroups?: FieldPolicy<any> | FieldReadFunction<any>,
	variantType?: FieldPolicy<any> | FieldReadFunction<any>,
	variantTypePopover?: FieldPolicy<any> | FieldReadFunction<any>,
	variantTypeTypeahead?: FieldPolicy<any> | FieldReadFunction<any>,
	variantTypes?: FieldPolicy<any> | FieldReadFunction<any>,
	variants?: FieldPolicy<any> | FieldReadFunction<any>,
	viewer?: FieldPolicy<any> | FieldReadFunction<any>
};
export type RejectRevisionsPayloadKeySpecifier = ('clientMutationId' | 'revisions' | RejectRevisionsPayloadKeySpecifier)[];
export type RejectRevisionsPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	revisions?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ResolveFlagPayloadKeySpecifier = ('clientMutationId' | 'flag' | ResolveFlagPayloadKeySpecifier)[];
export type ResolveFlagPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	flag?: FieldPolicy<any> | FieldReadFunction<any>
};
export type RevisionKeySpecifier = ('comments' | 'createdAt' | 'creationComment' | 'creationEvent' | 'currentValue' | 'events' | 'fieldName' | 'id' | 'lastCommentEvent' | 'link' | 'linkoutData' | 'name' | 'resolutionComment' | 'resolvedAt' | 'resolver' | 'resolvingEvent' | 'revisionSetId' | 'revisor' | 'status' | 'subject' | 'suggestedValue' | 'updatedAt' | RevisionKeySpecifier)[];
export type RevisionFieldPolicy = {
	comments?: FieldPolicy<any> | FieldReadFunction<any>,
	createdAt?: FieldPolicy<any> | FieldReadFunction<any>,
	creationComment?: FieldPolicy<any> | FieldReadFunction<any>,
	creationEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	currentValue?: FieldPolicy<any> | FieldReadFunction<any>,
	events?: FieldPolicy<any> | FieldReadFunction<any>,
	fieldName?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	lastCommentEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	linkoutData?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	resolutionComment?: FieldPolicy<any> | FieldReadFunction<any>,
	resolvedAt?: FieldPolicy<any> | FieldReadFunction<any>,
	resolver?: FieldPolicy<any> | FieldReadFunction<any>,
	resolvingEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	revisionSetId?: FieldPolicy<any> | FieldReadFunction<any>,
	revisor?: FieldPolicy<any> | FieldReadFunction<any>,
	status?: FieldPolicy<any> | FieldReadFunction<any>,
	subject?: FieldPolicy<any> | FieldReadFunction<any>,
	suggestedValue?: FieldPolicy<any> | FieldReadFunction<any>,
	updatedAt?: FieldPolicy<any> | FieldReadFunction<any>
};
export type RevisionConnectionKeySpecifier = ('edges' | 'nodes' | 'pageCount' | 'pageInfo' | 'revisedFieldNames' | 'totalCount' | 'unfilteredCountForSubject' | 'uniqueResolvers' | 'uniqueRevisors' | RevisionConnectionKeySpecifier)[];
export type RevisionConnectionFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageCount?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	revisedFieldNames?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>,
	unfilteredCountForSubject?: FieldPolicy<any> | FieldReadFunction<any>,
	uniqueResolvers?: FieldPolicy<any> | FieldReadFunction<any>,
	uniqueRevisors?: FieldPolicy<any> | FieldReadFunction<any>
};
export type RevisionEdgeKeySpecifier = ('cursor' | 'node' | RevisionEdgeKeySpecifier)[];
export type RevisionEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type RevisionResultKeySpecifier = ('fieldName' | 'id' | 'newlyCreated' | 'revisionSetId' | RevisionResultKeySpecifier)[];
export type RevisionResultFieldPolicy = {
	fieldName?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	newlyCreated?: FieldPolicy<any> | FieldReadFunction<any>,
	revisionSetId?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ScalarFieldKeySpecifier = ('value' | ScalarFieldKeySpecifier)[];
export type ScalarFieldFieldPolicy = {
	value?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ScalarFieldDiffKeySpecifier = ('left' | 'right' | ScalarFieldDiffKeySpecifier)[];
export type ScalarFieldDiffFieldPolicy = {
	left?: FieldPolicy<any> | FieldReadFunction<any>,
	right?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SearchResultKeySpecifier = ('id' | 'matchingText' | 'name' | 'resultType' | SearchResultKeySpecifier)[];
export type SearchResultFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	matchingText?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	resultType?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SourceKeySpecifier = ('abstract' | 'ascoAbstractId' | 'authorString' | 'citation' | 'citationId' | 'clinicalTrials' | 'comments' | 'displayType' | 'events' | 'fullJournalTitle' | 'id' | 'journal' | 'lastCommentEvent' | 'link' | 'name' | 'openAccess' | 'pmcId' | 'publicationDate' | 'publicationDay' | 'publicationMonth' | 'publicationYear' | 'sourceType' | 'sourceUrl' | 'title' | SourceKeySpecifier)[];
export type SourceFieldPolicy = {
	abstract?: FieldPolicy<any> | FieldReadFunction<any>,
	ascoAbstractId?: FieldPolicy<any> | FieldReadFunction<any>,
	authorString?: FieldPolicy<any> | FieldReadFunction<any>,
	citation?: FieldPolicy<any> | FieldReadFunction<any>,
	citationId?: FieldPolicy<any> | FieldReadFunction<any>,
	clinicalTrials?: FieldPolicy<any> | FieldReadFunction<any>,
	comments?: FieldPolicy<any> | FieldReadFunction<any>,
	displayType?: FieldPolicy<any> | FieldReadFunction<any>,
	events?: FieldPolicy<any> | FieldReadFunction<any>,
	fullJournalTitle?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	journal?: FieldPolicy<any> | FieldReadFunction<any>,
	lastCommentEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	openAccess?: FieldPolicy<any> | FieldReadFunction<any>,
	pmcId?: FieldPolicy<any> | FieldReadFunction<any>,
	publicationDate?: FieldPolicy<any> | FieldReadFunction<any>,
	publicationDay?: FieldPolicy<any> | FieldReadFunction<any>,
	publicationMonth?: FieldPolicy<any> | FieldReadFunction<any>,
	publicationYear?: FieldPolicy<any> | FieldReadFunction<any>,
	sourceType?: FieldPolicy<any> | FieldReadFunction<any>,
	sourceUrl?: FieldPolicy<any> | FieldReadFunction<any>,
	title?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SourcePopoverKeySpecifier = ('abstract' | 'ascoAbstractId' | 'authorString' | 'citation' | 'citationId' | 'clinicalTrials' | 'comments' | 'displayType' | 'events' | 'evidenceItemCount' | 'fullJournalTitle' | 'id' | 'journal' | 'lastCommentEvent' | 'link' | 'name' | 'openAccess' | 'pmcId' | 'publicationDate' | 'publicationDay' | 'publicationMonth' | 'publicationYear' | 'sourceType' | 'sourceUrl' | 'title' | SourcePopoverKeySpecifier)[];
export type SourcePopoverFieldPolicy = {
	abstract?: FieldPolicy<any> | FieldReadFunction<any>,
	ascoAbstractId?: FieldPolicy<any> | FieldReadFunction<any>,
	authorString?: FieldPolicy<any> | FieldReadFunction<any>,
	citation?: FieldPolicy<any> | FieldReadFunction<any>,
	citationId?: FieldPolicy<any> | FieldReadFunction<any>,
	clinicalTrials?: FieldPolicy<any> | FieldReadFunction<any>,
	comments?: FieldPolicy<any> | FieldReadFunction<any>,
	displayType?: FieldPolicy<any> | FieldReadFunction<any>,
	events?: FieldPolicy<any> | FieldReadFunction<any>,
	evidenceItemCount?: FieldPolicy<any> | FieldReadFunction<any>,
	fullJournalTitle?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	journal?: FieldPolicy<any> | FieldReadFunction<any>,
	lastCommentEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	openAccess?: FieldPolicy<any> | FieldReadFunction<any>,
	pmcId?: FieldPolicy<any> | FieldReadFunction<any>,
	publicationDate?: FieldPolicy<any> | FieldReadFunction<any>,
	publicationDay?: FieldPolicy<any> | FieldReadFunction<any>,
	publicationMonth?: FieldPolicy<any> | FieldReadFunction<any>,
	publicationYear?: FieldPolicy<any> | FieldReadFunction<any>,
	sourceType?: FieldPolicy<any> | FieldReadFunction<any>,
	sourceUrl?: FieldPolicy<any> | FieldReadFunction<any>,
	title?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SourceStubKeySpecifier = ('citationId' | 'id' | 'sourceType' | SourceStubKeySpecifier)[];
export type SourceStubFieldPolicy = {
	citationId?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	sourceType?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SourceSuggestionKeySpecifier = ('createdAt' | 'disease' | 'events' | 'id' | 'initialComment' | 'link' | 'molecularProfile' | 'name' | 'reason' | 'source' | 'status' | 'user' | SourceSuggestionKeySpecifier)[];
export type SourceSuggestionFieldPolicy = {
	createdAt?: FieldPolicy<any> | FieldReadFunction<any>,
	disease?: FieldPolicy<any> | FieldReadFunction<any>,
	events?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	initialComment?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	molecularProfile?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	reason?: FieldPolicy<any> | FieldReadFunction<any>,
	source?: FieldPolicy<any> | FieldReadFunction<any>,
	status?: FieldPolicy<any> | FieldReadFunction<any>,
	user?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SourceSuggestionConnectionKeySpecifier = ('edges' | 'filteredCount' | 'nodes' | 'pageCount' | 'pageInfo' | 'totalCount' | SourceSuggestionConnectionKeySpecifier)[];
export type SourceSuggestionConnectionFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	filteredCount?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageCount?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SourceSuggestionEdgeKeySpecifier = ('cursor' | 'node' | SourceSuggestionEdgeKeySpecifier)[];
export type SourceSuggestionEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SourceSuggestionValuesKeySpecifier = ('disease' | 'molecularProfile' | 'source' | SourceSuggestionValuesKeySpecifier)[];
export type SourceSuggestionValuesFieldPolicy = {
	disease?: FieldPolicy<any> | FieldReadFunction<any>,
	molecularProfile?: FieldPolicy<any> | FieldReadFunction<any>,
	source?: FieldPolicy<any> | FieldReadFunction<any>
};
export type StatsKeySpecifier = ('acceptedAssertions' | 'acceptedEvidenceItems' | 'appliedRevisions' | 'comments' | 'revisions' | 'submittedAssertions' | 'submittedEvidenceItems' | 'suggestedSources' | StatsKeySpecifier)[];
export type StatsFieldPolicy = {
	acceptedAssertions?: FieldPolicy<any> | FieldReadFunction<any>,
	acceptedEvidenceItems?: FieldPolicy<any> | FieldReadFunction<any>,
	appliedRevisions?: FieldPolicy<any> | FieldReadFunction<any>,
	comments?: FieldPolicy<any> | FieldReadFunction<any>,
	revisions?: FieldPolicy<any> | FieldReadFunction<any>,
	submittedAssertions?: FieldPolicy<any> | FieldReadFunction<any>,
	submittedEvidenceItems?: FieldPolicy<any> | FieldReadFunction<any>,
	suggestedSources?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SubmitAssertionPayloadKeySpecifier = ('assertion' | 'clientMutationId' | SubmitAssertionPayloadKeySpecifier)[];
export type SubmitAssertionPayloadFieldPolicy = {
	assertion?: FieldPolicy<any> | FieldReadFunction<any>,
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SubmitEvidenceItemPayloadKeySpecifier = ('clientMutationId' | 'evidenceItem' | SubmitEvidenceItemPayloadKeySpecifier)[];
export type SubmitEvidenceItemPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	evidenceItem?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SubmitVariantGroupPayloadKeySpecifier = ('clientMutationId' | 'variantGroup' | SubmitVariantGroupPayloadKeySpecifier)[];
export type SubmitVariantGroupPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	variantGroup?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SubscribableKeySpecifier = ('entityType' | 'id' | SubscribableKeySpecifier)[];
export type SubscribableFieldPolicy = {
	entityType?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SubscribePayloadKeySpecifier = ('clientMutationId' | 'subscriptions' | SubscribePayloadKeySpecifier)[];
export type SubscribePayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	subscriptions?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SubscriptionKeySpecifier = ('id' | 'subscribable' | SubscriptionKeySpecifier)[];
export type SubscriptionFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	subscribable?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SuggestAssertionRevisionPayloadKeySpecifier = ('assertion' | 'clientMutationId' | 'results' | SuggestAssertionRevisionPayloadKeySpecifier)[];
export type SuggestAssertionRevisionPayloadFieldPolicy = {
	assertion?: FieldPolicy<any> | FieldReadFunction<any>,
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	results?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SuggestEvidenceItemRevisionPayloadKeySpecifier = ('clientMutationId' | 'evidenceItem' | 'results' | SuggestEvidenceItemRevisionPayloadKeySpecifier)[];
export type SuggestEvidenceItemRevisionPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	evidenceItem?: FieldPolicy<any> | FieldReadFunction<any>,
	results?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SuggestGeneRevisionPayloadKeySpecifier = ('clientMutationId' | 'gene' | 'results' | SuggestGeneRevisionPayloadKeySpecifier)[];
export type SuggestGeneRevisionPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	gene?: FieldPolicy<any> | FieldReadFunction<any>,
	results?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SuggestMolecularProfileRevisionPayloadKeySpecifier = ('clientMutationId' | 'molecularProfile' | 'results' | SuggestMolecularProfileRevisionPayloadKeySpecifier)[];
export type SuggestMolecularProfileRevisionPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	molecularProfile?: FieldPolicy<any> | FieldReadFunction<any>,
	results?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SuggestSourcePayloadKeySpecifier = ('clientMutationId' | 'sourceSuggestion' | SuggestSourcePayloadKeySpecifier)[];
export type SuggestSourcePayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	sourceSuggestion?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SuggestVariantGroupRevisionPayloadKeySpecifier = ('clientMutationId' | 'results' | 'variantGroup' | SuggestVariantGroupRevisionPayloadKeySpecifier)[];
export type SuggestVariantGroupRevisionPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	results?: FieldPolicy<any> | FieldReadFunction<any>,
	variantGroup?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SuggestVariantRevisionPayloadKeySpecifier = ('clientMutationId' | 'results' | 'variant' | SuggestVariantRevisionPayloadKeySpecifier)[];
export type SuggestVariantRevisionPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	results?: FieldPolicy<any> | FieldReadFunction<any>,
	variant?: FieldPolicy<any> | FieldReadFunction<any>
};
export type TherapyKeySpecifier = ('id' | 'link' | 'myChemInfo' | 'name' | 'ncitId' | 'therapyAliases' | 'therapyUrl' | TherapyKeySpecifier)[];
export type TherapyFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	myChemInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	ncitId?: FieldPolicy<any> | FieldReadFunction<any>,
	therapyAliases?: FieldPolicy<any> | FieldReadFunction<any>,
	therapyUrl?: FieldPolicy<any> | FieldReadFunction<any>
};
export type TherapyPopoverKeySpecifier = ('assertionCount' | 'evidenceItemCount' | 'id' | 'link' | 'molecularProfileCount' | 'myChemInfo' | 'name' | 'ncitId' | 'therapyAliases' | 'therapyUrl' | TherapyPopoverKeySpecifier)[];
export type TherapyPopoverFieldPolicy = {
	assertionCount?: FieldPolicy<any> | FieldReadFunction<any>,
	evidenceItemCount?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	molecularProfileCount?: FieldPolicy<any> | FieldReadFunction<any>,
	myChemInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	ncitId?: FieldPolicy<any> | FieldReadFunction<any>,
	therapyAliases?: FieldPolicy<any> | FieldReadFunction<any>,
	therapyUrl?: FieldPolicy<any> | FieldReadFunction<any>
};
export type TimePointCountsKeySpecifier = ('allTime' | 'newThisMonth' | 'newThisWeek' | 'newThisYear' | TimePointCountsKeySpecifier)[];
export type TimePointCountsFieldPolicy = {
	allTime?: FieldPolicy<any> | FieldReadFunction<any>,
	newThisMonth?: FieldPolicy<any> | FieldReadFunction<any>,
	newThisWeek?: FieldPolicy<any> | FieldReadFunction<any>,
	newThisYear?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UnsubscribePayloadKeySpecifier = ('clientMutationId' | 'unsubscribedEntities' | UnsubscribePayloadKeySpecifier)[];
export type UnsubscribePayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	unsubscribedEntities?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UpdateCoiPayloadKeySpecifier = ('clientMutationId' | 'coiStatement' | UpdateCoiPayloadKeySpecifier)[];
export type UpdateCoiPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	coiStatement?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UpdateNotificationStatusPayloadKeySpecifier = ('clientMutationId' | 'notifications' | UpdateNotificationStatusPayloadKeySpecifier)[];
export type UpdateNotificationStatusPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	notifications?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UpdateSourceSuggestionStatusPayloadKeySpecifier = ('clientMutationId' | 'sourceSuggestion' | UpdateSourceSuggestionStatusPayloadKeySpecifier)[];
export type UpdateSourceSuggestionStatusPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	sourceSuggestion?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UserKeySpecifier = ('areaOfExpertise' | 'bio' | 'country' | 'displayName' | 'email' | 'events' | 'facebookProfile' | 'id' | 'linkedinProfile' | 'mostRecentActionTimestamp' | 'mostRecentConflictOfInterestStatement' | 'mostRecentEvent' | 'mostRecentOrg' | 'mostRecentOrganizationId' | 'name' | 'notifications' | 'orcid' | 'organizations' | 'profileImagePath' | 'role' | 'statsHash' | 'twitterHandle' | 'url' | 'username' | UserKeySpecifier)[];
export type UserFieldPolicy = {
	areaOfExpertise?: FieldPolicy<any> | FieldReadFunction<any>,
	bio?: FieldPolicy<any> | FieldReadFunction<any>,
	country?: FieldPolicy<any> | FieldReadFunction<any>,
	displayName?: FieldPolicy<any> | FieldReadFunction<any>,
	email?: FieldPolicy<any> | FieldReadFunction<any>,
	events?: FieldPolicy<any> | FieldReadFunction<any>,
	facebookProfile?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	linkedinProfile?: FieldPolicy<any> | FieldReadFunction<any>,
	mostRecentActionTimestamp?: FieldPolicy<any> | FieldReadFunction<any>,
	mostRecentConflictOfInterestStatement?: FieldPolicy<any> | FieldReadFunction<any>,
	mostRecentEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	mostRecentOrg?: FieldPolicy<any> | FieldReadFunction<any>,
	mostRecentOrganizationId?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	notifications?: FieldPolicy<any> | FieldReadFunction<any>,
	orcid?: FieldPolicy<any> | FieldReadFunction<any>,
	organizations?: FieldPolicy<any> | FieldReadFunction<any>,
	profileImagePath?: FieldPolicy<any> | FieldReadFunction<any>,
	role?: FieldPolicy<any> | FieldReadFunction<any>,
	statsHash?: FieldPolicy<any> | FieldReadFunction<any>,
	twitterHandle?: FieldPolicy<any> | FieldReadFunction<any>,
	url?: FieldPolicy<any> | FieldReadFunction<any>,
	username?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UserConnectionKeySpecifier = ('edges' | 'nodes' | 'pageCount' | 'pageInfo' | 'totalCount' | UserConnectionKeySpecifier)[];
export type UserConnectionFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageCount?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UserEdgeKeySpecifier = ('cursor' | 'node' | UserEdgeKeySpecifier)[];
export type UserEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ValidationErrorsKeySpecifier = ('genericErrors' | 'validationErrors' | ValidationErrorsKeySpecifier)[];
export type ValidationErrorsFieldPolicy = {
	genericErrors?: FieldPolicy<any> | FieldReadFunction<any>,
	validationErrors?: FieldPolicy<any> | FieldReadFunction<any>
};
export type VariantKeySpecifier = ('alleleRegistryId' | 'clinvarIds' | 'comments' | 'deprecated' | 'deprecationComment' | 'deprecationEvent' | 'deprecationReason' | 'ensemblVersion' | 'events' | 'flagged' | 'flags' | 'gene' | 'hgvsDescriptions' | 'id' | 'lastAcceptedRevisionEvent' | 'lastCommentEvent' | 'lastSubmittedRevisionEvent' | 'link' | 'maneSelectTranscript' | 'molecularProfiles' | 'myVariantInfo' | 'name' | 'openCravatUrl' | 'primaryCoordinates' | 'referenceBases' | 'referenceBuild' | 'revisions' | 'secondaryCoordinates' | 'singleVariantMolecularProfile' | 'singleVariantMolecularProfileId' | 'variantAliases' | 'variantBases' | 'variantTypes' | VariantKeySpecifier)[];
export type VariantFieldPolicy = {
	alleleRegistryId?: FieldPolicy<any> | FieldReadFunction<any>,
	clinvarIds?: FieldPolicy<any> | FieldReadFunction<any>,
	comments?: FieldPolicy<any> | FieldReadFunction<any>,
	deprecated?: FieldPolicy<any> | FieldReadFunction<any>,
	deprecationComment?: FieldPolicy<any> | FieldReadFunction<any>,
	deprecationEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	deprecationReason?: FieldPolicy<any> | FieldReadFunction<any>,
	ensemblVersion?: FieldPolicy<any> | FieldReadFunction<any>,
	events?: FieldPolicy<any> | FieldReadFunction<any>,
	flagged?: FieldPolicy<any> | FieldReadFunction<any>,
	flags?: FieldPolicy<any> | FieldReadFunction<any>,
	gene?: FieldPolicy<any> | FieldReadFunction<any>,
	hgvsDescriptions?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	lastAcceptedRevisionEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	lastCommentEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	lastSubmittedRevisionEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	maneSelectTranscript?: FieldPolicy<any> | FieldReadFunction<any>,
	molecularProfiles?: FieldPolicy<any> | FieldReadFunction<any>,
	myVariantInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	openCravatUrl?: FieldPolicy<any> | FieldReadFunction<any>,
	primaryCoordinates?: FieldPolicy<any> | FieldReadFunction<any>,
	referenceBases?: FieldPolicy<any> | FieldReadFunction<any>,
	referenceBuild?: FieldPolicy<any> | FieldReadFunction<any>,
	revisions?: FieldPolicy<any> | FieldReadFunction<any>,
	secondaryCoordinates?: FieldPolicy<any> | FieldReadFunction<any>,
	singleVariantMolecularProfile?: FieldPolicy<any> | FieldReadFunction<any>,
	singleVariantMolecularProfileId?: FieldPolicy<any> | FieldReadFunction<any>,
	variantAliases?: FieldPolicy<any> | FieldReadFunction<any>,
	variantBases?: FieldPolicy<any> | FieldReadFunction<any>,
	variantTypes?: FieldPolicy<any> | FieldReadFunction<any>
};
export type VariantAliasKeySpecifier = ('name' | VariantAliasKeySpecifier)[];
export type VariantAliasFieldPolicy = {
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type VariantConnectionKeySpecifier = ('edges' | 'nodes' | 'pageCount' | 'pageInfo' | 'totalCount' | VariantConnectionKeySpecifier)[];
export type VariantConnectionFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageCount?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type VariantEdgeKeySpecifier = ('cursor' | 'node' | VariantEdgeKeySpecifier)[];
export type VariantEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type VariantGroupKeySpecifier = ('comments' | 'description' | 'events' | 'flagged' | 'flags' | 'id' | 'lastAcceptedRevisionEvent' | 'lastCommentEvent' | 'lastSubmittedRevisionEvent' | 'link' | 'name' | 'revisions' | 'sources' | 'variants' | VariantGroupKeySpecifier)[];
export type VariantGroupFieldPolicy = {
	comments?: FieldPolicy<any> | FieldReadFunction<any>,
	description?: FieldPolicy<any> | FieldReadFunction<any>,
	events?: FieldPolicy<any> | FieldReadFunction<any>,
	flagged?: FieldPolicy<any> | FieldReadFunction<any>,
	flags?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	lastAcceptedRevisionEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	lastCommentEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	lastSubmittedRevisionEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	revisions?: FieldPolicy<any> | FieldReadFunction<any>,
	sources?: FieldPolicy<any> | FieldReadFunction<any>,
	variants?: FieldPolicy<any> | FieldReadFunction<any>
};
export type VariantGroupConnectionKeySpecifier = ('edges' | 'nodes' | 'pageCount' | 'pageInfo' | 'totalCount' | VariantGroupConnectionKeySpecifier)[];
export type VariantGroupConnectionFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageCount?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type VariantGroupEdgeKeySpecifier = ('cursor' | 'node' | VariantGroupEdgeKeySpecifier)[];
export type VariantGroupEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type VariantTypeKeySpecifier = ('description' | 'id' | 'link' | 'name' | 'soid' | 'url' | VariantTypeKeySpecifier)[];
export type VariantTypeFieldPolicy = {
	description?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	soid?: FieldPolicy<any> | FieldReadFunction<any>,
	url?: FieldPolicy<any> | FieldReadFunction<any>
};
export type VariantTypePopoverKeySpecifier = ('description' | 'id' | 'link' | 'name' | 'soid' | 'url' | 'variantCount' | VariantTypePopoverKeySpecifier)[];
export type VariantTypePopoverFieldPolicy = {
	description?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	soid?: FieldPolicy<any> | FieldReadFunction<any>,
	url?: FieldPolicy<any> | FieldReadFunction<any>,
	variantCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type WithRevisionsKeySpecifier = ('lastAcceptedRevisionEvent' | 'lastSubmittedRevisionEvent' | 'revisions' | WithRevisionsKeySpecifier)[];
export type WithRevisionsFieldPolicy = {
	lastAcceptedRevisionEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	lastSubmittedRevisionEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	revisions?: FieldPolicy<any> | FieldReadFunction<any>
};
export type StrictTypedTypePolicies = {
	AcceptRevisionsPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | AcceptRevisionsPayloadKeySpecifier | (() => undefined | AcceptRevisionsPayloadKeySpecifier),
		fields?: AcceptRevisionsPayloadFieldPolicy,
	},
	AcmgCode?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | AcmgCodeKeySpecifier | (() => undefined | AcmgCodeKeySpecifier),
		fields?: AcmgCodeFieldPolicy,
	},
	AddCommentPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | AddCommentPayloadKeySpecifier | (() => undefined | AddCommentPayloadKeySpecifier),
		fields?: AddCommentPayloadFieldPolicy,
	},
	AddDiseasePayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | AddDiseasePayloadKeySpecifier | (() => undefined | AddDiseasePayloadKeySpecifier),
		fields?: AddDiseasePayloadFieldPolicy,
	},
	AddRemoteCitationPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | AddRemoteCitationPayloadKeySpecifier | (() => undefined | AddRemoteCitationPayloadKeySpecifier),
		fields?: AddRemoteCitationPayloadFieldPolicy,
	},
	AddTherapyPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | AddTherapyPayloadKeySpecifier | (() => undefined | AddTherapyPayloadKeySpecifier),
		fields?: AddTherapyPayloadFieldPolicy,
	},
	AddVariantPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | AddVariantPayloadKeySpecifier | (() => undefined | AddVariantPayloadKeySpecifier),
		fields?: AddVariantPayloadFieldPolicy,
	},
	AdvancedSearchResult?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | AdvancedSearchResultKeySpecifier | (() => undefined | AdvancedSearchResultKeySpecifier),
		fields?: AdvancedSearchResultFieldPolicy,
	},
	Assertion?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | AssertionKeySpecifier | (() => undefined | AssertionKeySpecifier),
		fields?: AssertionFieldPolicy,
	},
	AssertionConnection?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | AssertionConnectionKeySpecifier | (() => undefined | AssertionConnectionKeySpecifier),
		fields?: AssertionConnectionFieldPolicy,
	},
	AssertionEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | AssertionEdgeKeySpecifier | (() => undefined | AssertionEdgeKeySpecifier),
		fields?: AssertionEdgeFieldPolicy,
	},
	BrowseClinicalTrial?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowseClinicalTrialKeySpecifier | (() => undefined | BrowseClinicalTrialKeySpecifier),
		fields?: BrowseClinicalTrialFieldPolicy,
	},
	BrowseClinicalTrialConnection?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowseClinicalTrialConnectionKeySpecifier | (() => undefined | BrowseClinicalTrialConnectionKeySpecifier),
		fields?: BrowseClinicalTrialConnectionFieldPolicy,
	},
	BrowseClinicalTrialEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowseClinicalTrialEdgeKeySpecifier | (() => undefined | BrowseClinicalTrialEdgeKeySpecifier),
		fields?: BrowseClinicalTrialEdgeFieldPolicy,
	},
	BrowseDisease?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowseDiseaseKeySpecifier | (() => undefined | BrowseDiseaseKeySpecifier),
		fields?: BrowseDiseaseFieldPolicy,
	},
	BrowseDiseaseConnection?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowseDiseaseConnectionKeySpecifier | (() => undefined | BrowseDiseaseConnectionKeySpecifier),
		fields?: BrowseDiseaseConnectionFieldPolicy,
	},
	BrowseDiseaseEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowseDiseaseEdgeKeySpecifier | (() => undefined | BrowseDiseaseEdgeKeySpecifier),
		fields?: BrowseDiseaseEdgeFieldPolicy,
	},
	BrowseGene?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowseGeneKeySpecifier | (() => undefined | BrowseGeneKeySpecifier),
		fields?: BrowseGeneFieldPolicy,
	},
	BrowseGeneConnection?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowseGeneConnectionKeySpecifier | (() => undefined | BrowseGeneConnectionKeySpecifier),
		fields?: BrowseGeneConnectionFieldPolicy,
	},
	BrowseGeneEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowseGeneEdgeKeySpecifier | (() => undefined | BrowseGeneEdgeKeySpecifier),
		fields?: BrowseGeneEdgeFieldPolicy,
	},
	BrowseMolecularProfile?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowseMolecularProfileKeySpecifier | (() => undefined | BrowseMolecularProfileKeySpecifier),
		fields?: BrowseMolecularProfileFieldPolicy,
	},
	BrowseMolecularProfileConnection?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowseMolecularProfileConnectionKeySpecifier | (() => undefined | BrowseMolecularProfileConnectionKeySpecifier),
		fields?: BrowseMolecularProfileConnectionFieldPolicy,
	},
	BrowseMolecularProfileEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowseMolecularProfileEdgeKeySpecifier | (() => undefined | BrowseMolecularProfileEdgeKeySpecifier),
		fields?: BrowseMolecularProfileEdgeFieldPolicy,
	},
	BrowsePhenotype?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowsePhenotypeKeySpecifier | (() => undefined | BrowsePhenotypeKeySpecifier),
		fields?: BrowsePhenotypeFieldPolicy,
	},
	BrowsePhenotypeConnection?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowsePhenotypeConnectionKeySpecifier | (() => undefined | BrowsePhenotypeConnectionKeySpecifier),
		fields?: BrowsePhenotypeConnectionFieldPolicy,
	},
	BrowsePhenotypeEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowsePhenotypeEdgeKeySpecifier | (() => undefined | BrowsePhenotypeEdgeKeySpecifier),
		fields?: BrowsePhenotypeEdgeFieldPolicy,
	},
	BrowseSource?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowseSourceKeySpecifier | (() => undefined | BrowseSourceKeySpecifier),
		fields?: BrowseSourceFieldPolicy,
	},
	BrowseSourceConnection?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowseSourceConnectionKeySpecifier | (() => undefined | BrowseSourceConnectionKeySpecifier),
		fields?: BrowseSourceConnectionFieldPolicy,
	},
	BrowseSourceEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowseSourceEdgeKeySpecifier | (() => undefined | BrowseSourceEdgeKeySpecifier),
		fields?: BrowseSourceEdgeFieldPolicy,
	},
	BrowseTherapy?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowseTherapyKeySpecifier | (() => undefined | BrowseTherapyKeySpecifier),
		fields?: BrowseTherapyFieldPolicy,
	},
	BrowseTherapyConnection?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowseTherapyConnectionKeySpecifier | (() => undefined | BrowseTherapyConnectionKeySpecifier),
		fields?: BrowseTherapyConnectionFieldPolicy,
	},
	BrowseTherapyEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowseTherapyEdgeKeySpecifier | (() => undefined | BrowseTherapyEdgeKeySpecifier),
		fields?: BrowseTherapyEdgeFieldPolicy,
	},
	BrowseVariant?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowseVariantKeySpecifier | (() => undefined | BrowseVariantKeySpecifier),
		fields?: BrowseVariantFieldPolicy,
	},
	BrowseVariantConnection?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowseVariantConnectionKeySpecifier | (() => undefined | BrowseVariantConnectionKeySpecifier),
		fields?: BrowseVariantConnectionFieldPolicy,
	},
	BrowseVariantEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowseVariantEdgeKeySpecifier | (() => undefined | BrowseVariantEdgeKeySpecifier),
		fields?: BrowseVariantEdgeFieldPolicy,
	},
	BrowseVariantGroup?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowseVariantGroupKeySpecifier | (() => undefined | BrowseVariantGroupKeySpecifier),
		fields?: BrowseVariantGroupFieldPolicy,
	},
	BrowseVariantGroupConnection?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowseVariantGroupConnectionKeySpecifier | (() => undefined | BrowseVariantGroupConnectionKeySpecifier),
		fields?: BrowseVariantGroupConnectionFieldPolicy,
	},
	BrowseVariantGroupEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowseVariantGroupEdgeKeySpecifier | (() => undefined | BrowseVariantGroupEdgeKeySpecifier),
		fields?: BrowseVariantGroupEdgeFieldPolicy,
	},
	BrowseVariantType?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowseVariantTypeKeySpecifier | (() => undefined | BrowseVariantTypeKeySpecifier),
		fields?: BrowseVariantTypeFieldPolicy,
	},
	BrowseVariantTypeConnection?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowseVariantTypeConnectionKeySpecifier | (() => undefined | BrowseVariantTypeConnectionKeySpecifier),
		fields?: BrowseVariantTypeConnectionFieldPolicy,
	},
	BrowseVariantTypeEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BrowseVariantTypeEdgeKeySpecifier | (() => undefined | BrowseVariantTypeEdgeKeySpecifier),
		fields?: BrowseVariantTypeEdgeFieldPolicy,
	},
	CivicTimepointStats?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CivicTimepointStatsKeySpecifier | (() => undefined | CivicTimepointStatsKeySpecifier),
		fields?: CivicTimepointStatsFieldPolicy,
	},
	ClingenCode?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ClingenCodeKeySpecifier | (() => undefined | ClingenCodeKeySpecifier),
		fields?: ClingenCodeFieldPolicy,
	},
	ClinicalTrial?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ClinicalTrialKeySpecifier | (() => undefined | ClinicalTrialKeySpecifier),
		fields?: ClinicalTrialFieldPolicy,
	},
	Coi?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CoiKeySpecifier | (() => undefined | CoiKeySpecifier),
		fields?: CoiFieldPolicy,
	},
	Comment?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CommentKeySpecifier | (() => undefined | CommentKeySpecifier),
		fields?: CommentFieldPolicy,
	},
	CommentConnection?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CommentConnectionKeySpecifier | (() => undefined | CommentConnectionKeySpecifier),
		fields?: CommentConnectionFieldPolicy,
	},
	CommentEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CommentEdgeKeySpecifier | (() => undefined | CommentEdgeKeySpecifier),
		fields?: CommentEdgeFieldPolicy,
	},
	CommentTagSegment?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CommentTagSegmentKeySpecifier | (() => undefined | CommentTagSegmentKeySpecifier),
		fields?: CommentTagSegmentFieldPolicy,
	},
	CommentTextSegment?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CommentTextSegmentKeySpecifier | (() => undefined | CommentTextSegmentKeySpecifier),
		fields?: CommentTextSegmentFieldPolicy,
	},
	Commentable?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CommentableKeySpecifier | (() => undefined | CommentableKeySpecifier),
		fields?: CommentableFieldPolicy,
	},
	ContributingUser?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ContributingUserKeySpecifier | (() => undefined | ContributingUserKeySpecifier),
		fields?: ContributingUserFieldPolicy,
	},
	ContributingUsersSummary?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ContributingUsersSummaryKeySpecifier | (() => undefined | ContributingUsersSummaryKeySpecifier),
		fields?: ContributingUsersSummaryFieldPolicy,
	},
	Contribution?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ContributionKeySpecifier | (() => undefined | ContributionKeySpecifier),
		fields?: ContributionFieldPolicy,
	},
	Coordinate?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CoordinateKeySpecifier | (() => undefined | CoordinateKeySpecifier),
		fields?: CoordinateFieldPolicy,
	},
	Country?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CountryKeySpecifier | (() => undefined | CountryKeySpecifier),
		fields?: CountryFieldPolicy,
	},
	CreateMolecularProfilePayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CreateMolecularProfilePayloadKeySpecifier | (() => undefined | CreateMolecularProfilePayloadKeySpecifier),
		fields?: CreateMolecularProfilePayloadFieldPolicy,
	},
	DataRelease?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | DataReleaseKeySpecifier | (() => undefined | DataReleaseKeySpecifier),
		fields?: DataReleaseFieldPolicy,
	},
	DeprecateVariantPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | DeprecateVariantPayloadKeySpecifier | (() => undefined | DeprecateVariantPayloadKeySpecifier),
		fields?: DeprecateVariantPayloadFieldPolicy,
	},
	Disease?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | DiseaseKeySpecifier | (() => undefined | DiseaseKeySpecifier),
		fields?: DiseaseFieldPolicy,
	},
	DiseasePopover?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | DiseasePopoverKeySpecifier | (() => undefined | DiseasePopoverKeySpecifier),
		fields?: DiseasePopoverFieldPolicy,
	},
	DownloadableFile?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | DownloadableFileKeySpecifier | (() => undefined | DownloadableFileKeySpecifier),
		fields?: DownloadableFileFieldPolicy,
	},
	EditUserPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | EditUserPayloadKeySpecifier | (() => undefined | EditUserPayloadKeySpecifier),
		fields?: EditUserPayloadFieldPolicy,
	},
	Event?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | EventKeySpecifier | (() => undefined | EventKeySpecifier),
		fields?: EventFieldPolicy,
	},
	EventConnection?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | EventConnectionKeySpecifier | (() => undefined | EventConnectionKeySpecifier),
		fields?: EventConnectionFieldPolicy,
	},
	EventEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | EventEdgeKeySpecifier | (() => undefined | EventEdgeKeySpecifier),
		fields?: EventEdgeFieldPolicy,
	},
	EventOriginObject?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | EventOriginObjectKeySpecifier | (() => undefined | EventOriginObjectKeySpecifier),
		fields?: EventOriginObjectFieldPolicy,
	},
	EventSubject?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | EventSubjectKeySpecifier | (() => undefined | EventSubjectKeySpecifier),
		fields?: EventSubjectFieldPolicy,
	},
	EventSubjectWithCount?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | EventSubjectWithCountKeySpecifier | (() => undefined | EventSubjectWithCountKeySpecifier),
		fields?: EventSubjectWithCountFieldPolicy,
	},
	EvidenceItem?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | EvidenceItemKeySpecifier | (() => undefined | EvidenceItemKeySpecifier),
		fields?: EvidenceItemFieldPolicy,
	},
	EvidenceItemConnection?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | EvidenceItemConnectionKeySpecifier | (() => undefined | EvidenceItemConnectionKeySpecifier),
		fields?: EvidenceItemConnectionFieldPolicy,
	},
	EvidenceItemEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | EvidenceItemEdgeKeySpecifier | (() => undefined | EvidenceItemEdgeKeySpecifier),
		fields?: EvidenceItemEdgeFieldPolicy,
	},
	EvidenceItemsByStatus?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | EvidenceItemsByStatusKeySpecifier | (() => undefined | EvidenceItemsByStatusKeySpecifier),
		fields?: EvidenceItemsByStatusFieldPolicy,
	},
	FdaCode?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | FdaCodeKeySpecifier | (() => undefined | FdaCodeKeySpecifier),
		fields?: FdaCodeFieldPolicy,
	},
	FieldName?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | FieldNameKeySpecifier | (() => undefined | FieldNameKeySpecifier),
		fields?: FieldNameFieldPolicy,
	},
	FieldValidationError?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | FieldValidationErrorKeySpecifier | (() => undefined | FieldValidationErrorKeySpecifier),
		fields?: FieldValidationErrorFieldPolicy,
	},
	Flag?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | FlagKeySpecifier | (() => undefined | FlagKeySpecifier),
		fields?: FlagFieldPolicy,
	},
	FlagConnection?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | FlagConnectionKeySpecifier | (() => undefined | FlagConnectionKeySpecifier),
		fields?: FlagConnectionFieldPolicy,
	},
	FlagEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | FlagEdgeKeySpecifier | (() => undefined | FlagEdgeKeySpecifier),
		fields?: FlagEdgeFieldPolicy,
	},
	FlagEntityPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | FlagEntityPayloadKeySpecifier | (() => undefined | FlagEntityPayloadKeySpecifier),
		fields?: FlagEntityPayloadFieldPolicy,
	},
	Flaggable?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | FlaggableKeySpecifier | (() => undefined | FlaggableKeySpecifier),
		fields?: FlaggableFieldPolicy,
	},
	Gene?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | GeneKeySpecifier | (() => undefined | GeneKeySpecifier),
		fields?: GeneFieldPolicy,
	},
	GeneConnection?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | GeneConnectionKeySpecifier | (() => undefined | GeneConnectionKeySpecifier),
		fields?: GeneConnectionFieldPolicy,
	},
	GeneEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | GeneEdgeKeySpecifier | (() => undefined | GeneEdgeKeySpecifier),
		fields?: GeneEdgeFieldPolicy,
	},
	LinkableDisease?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | LinkableDiseaseKeySpecifier | (() => undefined | LinkableDiseaseKeySpecifier),
		fields?: LinkableDiseaseFieldPolicy,
	},
	LinkableGene?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | LinkableGeneKeySpecifier | (() => undefined | LinkableGeneKeySpecifier),
		fields?: LinkableGeneFieldPolicy,
	},
	LinkableTherapy?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | LinkableTherapyKeySpecifier | (() => undefined | LinkableTherapyKeySpecifier),
		fields?: LinkableTherapyFieldPolicy,
	},
	LinkableVariant?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | LinkableVariantKeySpecifier | (() => undefined | LinkableVariantKeySpecifier),
		fields?: LinkableVariantFieldPolicy,
	},
	LinkableVariantType?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | LinkableVariantTypeKeySpecifier | (() => undefined | LinkableVariantTypeKeySpecifier),
		fields?: LinkableVariantTypeFieldPolicy,
	},
	LinkoutData?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | LinkoutDataKeySpecifier | (() => undefined | LinkoutDataKeySpecifier),
		fields?: LinkoutDataFieldPolicy,
	},
	ModerateAssertionPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ModerateAssertionPayloadKeySpecifier | (() => undefined | ModerateAssertionPayloadKeySpecifier),
		fields?: ModerateAssertionPayloadFieldPolicy,
	},
	ModerateEvidenceItemPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ModerateEvidenceItemPayloadKeySpecifier | (() => undefined | ModerateEvidenceItemPayloadKeySpecifier),
		fields?: ModerateEvidenceItemPayloadFieldPolicy,
	},
	ModeratedObjectField?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ModeratedObjectFieldKeySpecifier | (() => undefined | ModeratedObjectFieldKeySpecifier),
		fields?: ModeratedObjectFieldFieldPolicy,
	},
	MolecularProfile?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MolecularProfileKeySpecifier | (() => undefined | MolecularProfileKeySpecifier),
		fields?: MolecularProfileFieldPolicy,
	},
	MolecularProfileAlias?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MolecularProfileAliasKeySpecifier | (() => undefined | MolecularProfileAliasKeySpecifier),
		fields?: MolecularProfileAliasFieldPolicy,
	},
	MolecularProfileComponent?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MolecularProfileComponentKeySpecifier | (() => undefined | MolecularProfileComponentKeySpecifier),
		fields?: MolecularProfileComponentFieldPolicy,
	},
	MolecularProfileConnection?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MolecularProfileConnectionKeySpecifier | (() => undefined | MolecularProfileConnectionKeySpecifier),
		fields?: MolecularProfileConnectionFieldPolicy,
	},
	MolecularProfileEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MolecularProfileEdgeKeySpecifier | (() => undefined | MolecularProfileEdgeKeySpecifier),
		fields?: MolecularProfileEdgeFieldPolicy,
	},
	MolecularProfileNamePreview?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MolecularProfileNamePreviewKeySpecifier | (() => undefined | MolecularProfileNamePreviewKeySpecifier),
		fields?: MolecularProfileNamePreviewFieldPolicy,
	},
	MolecularProfileTextSegment?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MolecularProfileTextSegmentKeySpecifier | (() => undefined | MolecularProfileTextSegmentKeySpecifier),
		fields?: MolecularProfileTextSegmentFieldPolicy,
	},
	Mutation?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MutationKeySpecifier | (() => undefined | MutationKeySpecifier),
		fields?: MutationFieldPolicy,
	},
	MyChemInfo?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MyChemInfoKeySpecifier | (() => undefined | MyChemInfoKeySpecifier),
		fields?: MyChemInfoFieldPolicy,
	},
	MyDiseaseInfo?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MyDiseaseInfoKeySpecifier | (() => undefined | MyDiseaseInfoKeySpecifier),
		fields?: MyDiseaseInfoFieldPolicy,
	},
	MyVariantInfo?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MyVariantInfoKeySpecifier | (() => undefined | MyVariantInfoKeySpecifier),
		fields?: MyVariantInfoFieldPolicy,
	},
	NccnGuideline?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | NccnGuidelineKeySpecifier | (() => undefined | NccnGuidelineKeySpecifier),
		fields?: NccnGuidelineFieldPolicy,
	},
	Notification?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | NotificationKeySpecifier | (() => undefined | NotificationKeySpecifier),
		fields?: NotificationFieldPolicy,
	},
	NotificationConnection?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | NotificationConnectionKeySpecifier | (() => undefined | NotificationConnectionKeySpecifier),
		fields?: NotificationConnectionFieldPolicy,
	},
	NotificationEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | NotificationEdgeKeySpecifier | (() => undefined | NotificationEdgeKeySpecifier),
		fields?: NotificationEdgeFieldPolicy,
	},
	ObjectField?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ObjectFieldKeySpecifier | (() => undefined | ObjectFieldKeySpecifier),
		fields?: ObjectFieldFieldPolicy,
	},
	ObjectFieldDiff?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ObjectFieldDiffKeySpecifier | (() => undefined | ObjectFieldDiffKeySpecifier),
		fields?: ObjectFieldDiffFieldPolicy,
	},
	Organization?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | OrganizationKeySpecifier | (() => undefined | OrganizationKeySpecifier),
		fields?: OrganizationFieldPolicy,
	},
	OrganizationConnection?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | OrganizationConnectionKeySpecifier | (() => undefined | OrganizationConnectionKeySpecifier),
		fields?: OrganizationConnectionFieldPolicy,
	},
	OrganizationEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | OrganizationEdgeKeySpecifier | (() => undefined | OrganizationEdgeKeySpecifier),
		fields?: OrganizationEdgeFieldPolicy,
	},
	PageInfo?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | PageInfoKeySpecifier | (() => undefined | PageInfoKeySpecifier),
		fields?: PageInfoFieldPolicy,
	},
	Phenotype?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | PhenotypeKeySpecifier | (() => undefined | PhenotypeKeySpecifier),
		fields?: PhenotypeFieldPolicy,
	},
	PhenotypePopover?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | PhenotypePopoverKeySpecifier | (() => undefined | PhenotypePopoverKeySpecifier),
		fields?: PhenotypePopoverFieldPolicy,
	},
	Query?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | QueryKeySpecifier | (() => undefined | QueryKeySpecifier),
		fields?: QueryFieldPolicy,
	},
	RejectRevisionsPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | RejectRevisionsPayloadKeySpecifier | (() => undefined | RejectRevisionsPayloadKeySpecifier),
		fields?: RejectRevisionsPayloadFieldPolicy,
	},
	ResolveFlagPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ResolveFlagPayloadKeySpecifier | (() => undefined | ResolveFlagPayloadKeySpecifier),
		fields?: ResolveFlagPayloadFieldPolicy,
	},
	Revision?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | RevisionKeySpecifier | (() => undefined | RevisionKeySpecifier),
		fields?: RevisionFieldPolicy,
	},
	RevisionConnection?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | RevisionConnectionKeySpecifier | (() => undefined | RevisionConnectionKeySpecifier),
		fields?: RevisionConnectionFieldPolicy,
	},
	RevisionEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | RevisionEdgeKeySpecifier | (() => undefined | RevisionEdgeKeySpecifier),
		fields?: RevisionEdgeFieldPolicy,
	},
	RevisionResult?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | RevisionResultKeySpecifier | (() => undefined | RevisionResultKeySpecifier),
		fields?: RevisionResultFieldPolicy,
	},
	ScalarField?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ScalarFieldKeySpecifier | (() => undefined | ScalarFieldKeySpecifier),
		fields?: ScalarFieldFieldPolicy,
	},
	ScalarFieldDiff?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ScalarFieldDiffKeySpecifier | (() => undefined | ScalarFieldDiffKeySpecifier),
		fields?: ScalarFieldDiffFieldPolicy,
	},
	SearchResult?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SearchResultKeySpecifier | (() => undefined | SearchResultKeySpecifier),
		fields?: SearchResultFieldPolicy,
	},
	Source?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SourceKeySpecifier | (() => undefined | SourceKeySpecifier),
		fields?: SourceFieldPolicy,
	},
	SourcePopover?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SourcePopoverKeySpecifier | (() => undefined | SourcePopoverKeySpecifier),
		fields?: SourcePopoverFieldPolicy,
	},
	SourceStub?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SourceStubKeySpecifier | (() => undefined | SourceStubKeySpecifier),
		fields?: SourceStubFieldPolicy,
	},
	SourceSuggestion?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SourceSuggestionKeySpecifier | (() => undefined | SourceSuggestionKeySpecifier),
		fields?: SourceSuggestionFieldPolicy,
	},
	SourceSuggestionConnection?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SourceSuggestionConnectionKeySpecifier | (() => undefined | SourceSuggestionConnectionKeySpecifier),
		fields?: SourceSuggestionConnectionFieldPolicy,
	},
	SourceSuggestionEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SourceSuggestionEdgeKeySpecifier | (() => undefined | SourceSuggestionEdgeKeySpecifier),
		fields?: SourceSuggestionEdgeFieldPolicy,
	},
	SourceSuggestionValues?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SourceSuggestionValuesKeySpecifier | (() => undefined | SourceSuggestionValuesKeySpecifier),
		fields?: SourceSuggestionValuesFieldPolicy,
	},
	Stats?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | StatsKeySpecifier | (() => undefined | StatsKeySpecifier),
		fields?: StatsFieldPolicy,
	},
	SubmitAssertionPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SubmitAssertionPayloadKeySpecifier | (() => undefined | SubmitAssertionPayloadKeySpecifier),
		fields?: SubmitAssertionPayloadFieldPolicy,
	},
	SubmitEvidenceItemPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SubmitEvidenceItemPayloadKeySpecifier | (() => undefined | SubmitEvidenceItemPayloadKeySpecifier),
		fields?: SubmitEvidenceItemPayloadFieldPolicy,
	},
	SubmitVariantGroupPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SubmitVariantGroupPayloadKeySpecifier | (() => undefined | SubmitVariantGroupPayloadKeySpecifier),
		fields?: SubmitVariantGroupPayloadFieldPolicy,
	},
	Subscribable?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SubscribableKeySpecifier | (() => undefined | SubscribableKeySpecifier),
		fields?: SubscribableFieldPolicy,
	},
	SubscribePayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SubscribePayloadKeySpecifier | (() => undefined | SubscribePayloadKeySpecifier),
		fields?: SubscribePayloadFieldPolicy,
	},
	Subscription?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SubscriptionKeySpecifier | (() => undefined | SubscriptionKeySpecifier),
		fields?: SubscriptionFieldPolicy,
	},
	SuggestAssertionRevisionPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SuggestAssertionRevisionPayloadKeySpecifier | (() => undefined | SuggestAssertionRevisionPayloadKeySpecifier),
		fields?: SuggestAssertionRevisionPayloadFieldPolicy,
	},
	SuggestEvidenceItemRevisionPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SuggestEvidenceItemRevisionPayloadKeySpecifier | (() => undefined | SuggestEvidenceItemRevisionPayloadKeySpecifier),
		fields?: SuggestEvidenceItemRevisionPayloadFieldPolicy,
	},
	SuggestGeneRevisionPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SuggestGeneRevisionPayloadKeySpecifier | (() => undefined | SuggestGeneRevisionPayloadKeySpecifier),
		fields?: SuggestGeneRevisionPayloadFieldPolicy,
	},
	SuggestMolecularProfileRevisionPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SuggestMolecularProfileRevisionPayloadKeySpecifier | (() => undefined | SuggestMolecularProfileRevisionPayloadKeySpecifier),
		fields?: SuggestMolecularProfileRevisionPayloadFieldPolicy,
	},
	SuggestSourcePayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SuggestSourcePayloadKeySpecifier | (() => undefined | SuggestSourcePayloadKeySpecifier),
		fields?: SuggestSourcePayloadFieldPolicy,
	},
	SuggestVariantGroupRevisionPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SuggestVariantGroupRevisionPayloadKeySpecifier | (() => undefined | SuggestVariantGroupRevisionPayloadKeySpecifier),
		fields?: SuggestVariantGroupRevisionPayloadFieldPolicy,
	},
	SuggestVariantRevisionPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SuggestVariantRevisionPayloadKeySpecifier | (() => undefined | SuggestVariantRevisionPayloadKeySpecifier),
		fields?: SuggestVariantRevisionPayloadFieldPolicy,
	},
	Therapy?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | TherapyKeySpecifier | (() => undefined | TherapyKeySpecifier),
		fields?: TherapyFieldPolicy,
	},
	TherapyPopover?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | TherapyPopoverKeySpecifier | (() => undefined | TherapyPopoverKeySpecifier),
		fields?: TherapyPopoverFieldPolicy,
	},
	TimePointCounts?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | TimePointCountsKeySpecifier | (() => undefined | TimePointCountsKeySpecifier),
		fields?: TimePointCountsFieldPolicy,
	},
	UnsubscribePayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UnsubscribePayloadKeySpecifier | (() => undefined | UnsubscribePayloadKeySpecifier),
		fields?: UnsubscribePayloadFieldPolicy,
	},
	UpdateCoiPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UpdateCoiPayloadKeySpecifier | (() => undefined | UpdateCoiPayloadKeySpecifier),
		fields?: UpdateCoiPayloadFieldPolicy,
	},
	UpdateNotificationStatusPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UpdateNotificationStatusPayloadKeySpecifier | (() => undefined | UpdateNotificationStatusPayloadKeySpecifier),
		fields?: UpdateNotificationStatusPayloadFieldPolicy,
	},
	UpdateSourceSuggestionStatusPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UpdateSourceSuggestionStatusPayloadKeySpecifier | (() => undefined | UpdateSourceSuggestionStatusPayloadKeySpecifier),
		fields?: UpdateSourceSuggestionStatusPayloadFieldPolicy,
	},
	User?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UserKeySpecifier | (() => undefined | UserKeySpecifier),
		fields?: UserFieldPolicy,
	},
	UserConnection?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UserConnectionKeySpecifier | (() => undefined | UserConnectionKeySpecifier),
		fields?: UserConnectionFieldPolicy,
	},
	UserEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UserEdgeKeySpecifier | (() => undefined | UserEdgeKeySpecifier),
		fields?: UserEdgeFieldPolicy,
	},
	ValidationErrors?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ValidationErrorsKeySpecifier | (() => undefined | ValidationErrorsKeySpecifier),
		fields?: ValidationErrorsFieldPolicy,
	},
	Variant?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | VariantKeySpecifier | (() => undefined | VariantKeySpecifier),
		fields?: VariantFieldPolicy,
	},
	VariantAlias?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | VariantAliasKeySpecifier | (() => undefined | VariantAliasKeySpecifier),
		fields?: VariantAliasFieldPolicy,
	},
	VariantConnection?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | VariantConnectionKeySpecifier | (() => undefined | VariantConnectionKeySpecifier),
		fields?: VariantConnectionFieldPolicy,
	},
	VariantEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | VariantEdgeKeySpecifier | (() => undefined | VariantEdgeKeySpecifier),
		fields?: VariantEdgeFieldPolicy,
	},
	VariantGroup?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | VariantGroupKeySpecifier | (() => undefined | VariantGroupKeySpecifier),
		fields?: VariantGroupFieldPolicy,
	},
	VariantGroupConnection?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | VariantGroupConnectionKeySpecifier | (() => undefined | VariantGroupConnectionKeySpecifier),
		fields?: VariantGroupConnectionFieldPolicy,
	},
	VariantGroupEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | VariantGroupEdgeKeySpecifier | (() => undefined | VariantGroupEdgeKeySpecifier),
		fields?: VariantGroupEdgeFieldPolicy,
	},
	VariantType?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | VariantTypeKeySpecifier | (() => undefined | VariantTypeKeySpecifier),
		fields?: VariantTypeFieldPolicy,
	},
	VariantTypePopover?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | VariantTypePopoverKeySpecifier | (() => undefined | VariantTypePopoverKeySpecifier),
		fields?: VariantTypePopoverFieldPolicy,
	},
	WithRevisions?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | WithRevisionsKeySpecifier | (() => undefined | WithRevisionsKeySpecifier),
		fields?: WithRevisionsFieldPolicy,
	}
};
export type TypedTypePolicies = StrictTypedTypePolicies & TypePolicies;