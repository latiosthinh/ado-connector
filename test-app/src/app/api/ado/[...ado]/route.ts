
import { createAdoHandler } from 'ado-connector';

const handler = createAdoHandler({
    organization: process.env.ADO_ORG || 'test options',
    project: process.env.ADO_PROJECT || 'test project',
    pat: process.env.ADO_PAT || 'test pat',
});

export { handler as GET, handler as POST, handler as PATCH };
