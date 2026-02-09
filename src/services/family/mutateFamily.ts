import { supabase } from '@/services/supabase';
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
            birth_date: person.dob?.date,
            death_date: person.dod?.date,
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

export const updateFamilyMember = async (id: string, data: Partial<Person>) => {
    const updateData: any = {};
    if (data.fullName !== undefined) updateData.full_name = data.fullName;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.isAlive !== undefined) updateData.is_alive = data.isAlive;
    if (data.branch !== undefined) updateData.branch = data.branch;
    if (data.order !== undefined) updateData.generation = data.order;
    if (data.bio !== undefined) updateData.description = data.bio;
    if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;
    if (data.dob !== undefined) updateData.birth_date = data.dob?.date;
    if (data.dod !== undefined) updateData.death_date = data.dod?.date;

    if (Object.keys(updateData).length === 0) return;

    const { error } = await supabase.from('people').update(updateData).eq('id', id);
    if (error) throw error;
};
