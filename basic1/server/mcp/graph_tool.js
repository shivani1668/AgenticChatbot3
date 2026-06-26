import neo4j from 'neo4j-driver';

/**
 * Tool for interacting with Neo4j Aura (Free Tier)
 * Used for mapping member skills and project dependencies.
 */
let driver;
if (process.env.NEO4J_URI && process.env.NEO4J_USERNAME && process.env.NEO4J_PASSWORD) {
  driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
  );
}

export const getMemberContext = async (email) => {
  if (!driver) return [];
  const session = driver.session();
  try {
    const result = await session.run(
      'MATCH (u:User {email: $email})-[:HAS_SKILL]->(s:Skill) RETURN s.name as skill',
      { email }
    );
    return result.records.map(record => record.get('skill'));
  } catch (error) {
    console.error('Neo4j Error:', error);
    return [];
  } finally {
    await session.close();
  }
};

export const addSkillToMember = async (email, skillName) => {
  if (!driver) return;
  const session = driver.session();
  try {
    await session.run(
      'MERGE (u:User {email: $email}) MERGE (s:Skill {name: $skillName}) MERGE (u)-[:HAS_SKILL]->(s)',
      { email, skillName }
    );
  } finally {
    await session.close();
  }
};
