'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

const categories = ['Frontend', 'Backend', 'Tools', 'Database', 'DevOps', 'Mobile', 'Testing', 'Other'];

const proficiencyLevels = [
  { value: 1, label: 'Beginner', color: 'bg-red-500' },
  { value: 2, label: 'Novice', color: 'bg-orange-500' },
  { value: 3, label: 'Intermediate', color: 'bg-yellow-500' },
  { value: 4, label: 'Advanced', color: 'bg-blue-500' },
  { value: 5, label: 'Expert', color: 'bg-green-500' },
];

type Skill = {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  description: string;
  icon: string;
  featured: boolean;
  sortOrder: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    proficiency: 3,
    description: '',
    icon: '',
    featured: false,
    sortOrder: 0,
    tags: [] as string[],
  });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/skills?limit=100');
      const data = await response.json();
      setSkills(data.data.skills || []);
    } catch (error) {
      toast.error('Failed to fetch skills');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const skillData = {
        ...formData,
        sortOrder: parseInt(formData.sortOrder.toString()),
      };

      const url = editingSkill ? `/api/skills/${editingSkill.id}` : '/api/skills';
      const method = editingSkill ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(skillData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(editingSkill ? 'Skill updated successfully' : 'Skill created successfully');
        setIsDialogOpen(false);
        resetForm();
        fetchSkills();
      } else {
        toast.error(result.error || 'Failed to save skill');
      }
    } catch (error) {
      toast.error('Failed to save skill');
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
      description: skill.description || '',
      icon: skill.icon || '',
      featured: skill.featured,
      sortOrder: skill.sortOrder,
      tags: skill.tags || [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    try {
      const response = await fetch(`/api/skills/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Skill deleted successfully');
        fetchSkills();
      } else {
        toast.error('Failed to delete skill');
      }
    } catch (error) {
      toast.error('Failed to delete skill');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      proficiency: 3,
      description: '',
      icon: '',
      featured: false,
      sortOrder: 0,
      tags: [],
    });
    setEditingSkill(null);
  };

  const addTag = (tag: string) => {
    const cleanTag = tag.trim().toLowerCase();
    if (cleanTag && !formData.tags.includes(cleanTag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, cleanTag] }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const getProficiencyBadge = (proficiency: number) => {
    const level = proficiencyLevels.find(l => l.value === proficiency);
    return level ? { label: level.label, color: level.color } : { label: 'Unknown', color: 'bg-gray-500' };
  };

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || skill.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const skillsByCategory = Object.entries(
    filteredSkills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<string, Skill[]>)
  ).sort(([a], [b]) => categories.indexOf(a) - categories.indexOf(b));

  if (loading) {
    return <div className="p-6">Loading skills...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Skills</h1>
          <p className="text-muted-foreground">Manage your technical skills</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingSkill ? 'Edit Skill' : 'Add New Skill'}</DialogTitle>
              <DialogDescription>
                {editingSkill ? 'Update skill details below.' : 'Fill in details to create a new skill.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Skill Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., React"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(category) => setFormData(prev => ({ ...prev, category }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="proficiency">Proficiency Level *</Label>
                  <Select
                    value={formData.proficiency.toString()}
                    onValueChange={(proficiency) => setFormData(prev => ({ ...prev, proficiency: parseInt(proficiency) }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {proficiencyLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value.toString()}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${level.color}`}></div>
                            <span>{level.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    min="0"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the skill and your experience"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icon URL</Label>
                <Input
                  id="icon"
                  type="url"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="https://example.com/icon.png"
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Add a tag and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>
                {formData.category && (
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${proficiencyLevels.find(l => l.value === formData.proficiency)?.color}`}></div>
                    <span className="text-sm text-muted-foreground">
                      Preview: {formData.name} ({proficiencyLevels.find(l => l.value === formData.proficiency)?.label})
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSkill ? 'Update' : 'Create'} Skill
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={filterCategory}
          onValueChange={setFilterCategory}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-8">
        {skillsByCategory.map(([category, categorySkills]) => (
          <div key={category} className="space-y-4">
            <h2 className="text-xl font-semibold">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorySkills
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((skill) => {
                  const proficiency = getProficiencyBadge(skill.proficiency);
                  return (
                    <Card key={skill.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            {skill.icon && (
                              <img
                                src={skill.icon}
                                alt={skill.name}
                                className="w-6 h-6 rounded"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <CardTitle className="text-lg">{skill.name}</CardTitle>
                            {skill.featured && <Badge variant="default" className="text-xs">Featured</Badge>}
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(skill)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(skill.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${proficiency.color}`}></div>
                            <span className="text-sm font-medium">{proficiency.label}</span>
                          </div>
                          {skill.description && (
                            <p className="text-sm text-muted-foreground">{skill.description}</p>
                          )}
                          {skill.tags && skill.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {skill.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {filteredSkills.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No skills found.</p>
        </div>
      )}
    </div>
  );
}