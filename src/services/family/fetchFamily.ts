import { supabase } from '@/services/supabase';
import { Person, Relationship } from '@/types/types';

export const fetchFamilyData = async () => {
    const { data: peopleData, error: peopleError } = await supabase
        .from('people')
        .select('*')
        .order('generation', { ascending: true });

    const { data: relData, error: relError } = await supabase
        .from('relationships')
        .select('*');

    if (peopleError || relError) throw peopleError || relError;

    const people: Person[] = peopleData.map((p: any) => ({
        id: p.id,
        fullName: p.full_name,
        gender: p.gender,
        isAlive: p.is_alive,
        avatarUrl: p.avatar_url,
        branch: p.branch,
        order: p.generation,
        bio: p.description,
        dob: p.birth_date ? { date: p.birth_date, type: 'solar' } : undefined,
        dod: p.death_date ? { date: p.death_date, type: 'solar' } : undefined,
        images: [],
    }));

    const relationships: Relationship[] = relData.map((r: any) => ({
        id: r.id,
        source: r.source_id,
        target: r.target_id,
        type: r.type,
    }));

    return { people, relationships };
};
