import { supabase } from '../supabase';
import { Person } from '@/types/types';

export const addFamilyMember = async (person: Person, sourceId?: string, targetId?: string, spouseId?: string) => {
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

    if (sourceId) {
        await supabase.from('relationships').insert({ source_id: sourceId, target_id: person.id, type: 'blood' });
    } else if (targetId) {
        await supabase.from('relationships').insert({ source_id: person.id, target_id: targetId, type: 'blood' });
    } else if (spouseId) {
        await supabase.from('relationships').insert({ source_id: spouseId, target_id: person.id, type: 'spouse' });
    }

    return data;
};

export const deleteFamilyMember = async (id: string) => {
    const { error } = await supabase.from('people').delete().eq('id', id);
    if (error) throw error;
};
