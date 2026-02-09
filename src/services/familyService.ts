import { supabase } from './supabase';
import { Person, Relationship } from '@/types/types';

export const familyService = {
    async fetchAll() {
        const { data: peopleData, error: peopleError } = await supabase
            .from('people')
            .select('*')
            .order('generation', { ascending: true });

        const { data: relData, error: relError } = await supabase
            .from('relationships')
            .select('*');

        if (peopleError || relError) throw peopleError || relError;

        // Map DB snake_case to Frontend camelCase
        const people: Person[] = peopleData.map((p: any) => ({
            id: p.id,
            fullName: p.full_name,
            gender: p.gender,
            isAlive: p.is_alive,
            avatarUrl: p.avatar_url,
            branch: p.branch,
            order: p.generation,
            bio: p.description,
            images: [], // DB doesn't have this yet, or we'll handle separately
        }));

        const relationships: Relationship[] = relData.map((r: any) => ({
            id: r.id,
            source: r.source_id,
            target: r.target_id,
            type: r.type,
        }));

        return { people, relationships };
    },

    async addPerson(person: Person, sourceId?: string, targetId?: string, spouseId?: string) {
        const { data, error } = await supabase
            .from('people')
            .insert({
                id: person.id,
                full_name: person.fullName,
                gender: person.gender,
                is_alive: person.isAlive,
                branch: person.branch,
                generation: person.order,
            })
            .select()
            .single();

        if (error) throw error;

        let relError;
        if (sourceId) {
            const { error } = await supabase.from('relationships').insert({ source_id: sourceId, target_id: person.id, type: 'blood' });
            relError = error;
        } else if (targetId) {
            const { error } = await supabase.from('relationships').insert({ source_id: person.id, target_id: targetId, type: 'blood' });
            relError = error;
        } else if (spouseId) {
            const { error } = await supabase.from('relationships').insert({ source_id: spouseId, target_id: person.id, type: 'spouse' });
            relError = error;
        }

        if (relError) throw relError;
        return data;
    },

    async deletePerson(id: string) {
        const { error } = await supabase.from('people').delete().eq('id', id);
        if (error) throw error;
    }
};
