'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit, Plus, Search, Building, Calendar } from 'lucide-react';
import { toast } from 'sonner';

type Experience = {
  id: string;
  company: string;
  position: string;
  location: string;
  description: string;
  responsibilities: string[];
  achievements: string;
  companyLogo: string;
  currentJob: boolean;
  sortOrder: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
};

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    location: '',
    description: '',
    responsibilities: [] as string[],
    achievements: '',
    companyLogo: '',
    currentJob: false,
    sortOrder: 0,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const response = await fetch('/api/experience');
      const data = await response.json();
      const processedExperiences = (data.data.experience || []).map((exp: any) => ({
        ...exp,
        responsibilities: exp.responsibilities ? JSON.parse(exp.responsibilities) : [],
      }));
      setExperiences(processedExperiences);
    } catch (error) {
      toast.error('Failed to fetch experiences');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const experienceData = {
      ...formData,
      responsibilities: formData.responsibilities.filter(r => r.trim()),
      sortOrder: parseInt(formData.sortOrder.toString()),
    };

    const url = editingExperience ? `/api/experience/${editingExperience.id}` : '/api/experience';
    const method = editingExperience ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(experienceData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(editingExperience ? 'Experience updated successfully' : 'Experience created successfully');
        setIsDialogOpen(false);
        resetForm();
        fetchExperiences();
      } else {
        toast.error(result.error || 'Failed to save experience');
      }
    } catch (error) {
      toast.error('Failed to save experience');
    }
  };

  const handleEdit = (experience: Experience) => {
    setEditingExperience(experience);
    setFormData({
      company: experience.company,
      position: experience.position,
      location: experience.location,
      description: experience.description,
      responsibilities: experience.responsibilities || [],
      achievements: experience.achievements || '',
      companyLogo: experience.companyLogo || '',
      currentJob: experience.currentJob,
      sortOrder: experience.sortOrder,
      startDate: experience.startDate ? new Date(experience.startDate).toISOString().split('T')[0] : '',
      endDate: experience.endDate ? new Date(experience.endDate).toISOString().split('T')[0] : '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;

    try {
      const response = await fetch(`/api/experience/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Experience deleted successfully');
        fetchExperiences();
      } else {
        toast.error('Failed to delete experience');
      }
    } catch (error) {
      toast.error('Failed to delete experience');
    }
  };

  const resetForm = () => {
    setFormData({
      company: '',
      position: '',
      location: '',
      description: '',
      responsibilities: [],
      achievements: '',
      companyLogo: '',
      currentJob: false,
      sortOrder: 0,
      startDate: '',
      endDate: '',
    });
    setEditingExperience(null);
  };

  const addResponsibility = (responsibility: string) => {
    const cleanResponsibility = responsibility.trim();
    if (cleanResponsibility && !formData.responsibilities.includes(cleanResponsibility)) {
      setFormData(prev => ({ ...prev, responsibilities: [...prev.responsibilities, cleanResponsibility] }));
    }
  };

  const removeResponsibility = (responsibilityToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter(r => r !== responsibilityToRemove)
    }));
  };

  const moveResponsibility = (index: number, direction: 'up' | 'down') => {
    const newResponsibilities = [...formData.responsibilities];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < newResponsibilities.length) {
      [newResponsibilities[index], newResponsibilities[newIndex]] = [newResponsibilities[newIndex], newResponsibilities[index]];
      setFormData(prev => ({ ...prev, responsibilities: newResponsibilities }));
    }
  };

  const formatDateRange = (startDate: string, endDate: string | null, currentJob: boolean) => {
    const start = new Date(startDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
    if (currentJob) {
      return `${start} - Present`;
    }
    if (endDate) {
      const end = new Date(endDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
      });
      return `${start} - ${end}`;
    }
    return start;
  };

  if (loading) {
    return <div className="p-6">Loading experiences...</div>;
  }

  const sortedExperiences = [...experiences].sort((a, b) => {
    if (a.currentJob && !b.currentJob) return -1;
    if (!a.currentJob && b.currentJob) return 1;
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Work Experience</h1>
          <p className="text-muted-foreground">Manage your professional experience</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Experience
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingExperience ? 'Edit Experience' : 'Add New Experience'}</DialogTitle>
              <DialogDescription>
                {editingExperience ? 'Update experience details below.' : 'Fill in details to add a new work experience.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Company name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="Job title"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State or Remote"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyLogo">Company Logo URL</Label>
                  <Input
                    id="companyLogo"
                    type="url"
                    value={formData.companyLogo}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyLogo: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    disabled={formData.currentJob}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of your role and company"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Key Responsibilities</Label>
                <div className="space-y-2">
                  {formData.responsibilities.map((responsibility, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => moveResponsibility(index, 'up')}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => moveResponsibility(index, 'down')}
                        disabled={index === formData.responsibilities.length - 1}
                      >
                        ↓
                      </Button>
                      <Input
                        value={responsibility}
                        onChange={(e) => {
                          const newResponsibilities = [...formData.responsibilities];
                          newResponsibilities[index] = e.target.value;
                          setFormData(prev => ({ ...prev, responsibilities: newResponsibilities }));
                        }}
                        placeholder="Responsibility description"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeResponsibility(responsibility)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
                <Input
                  placeholder="Add a new responsibility and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addResponsibility(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="achievements">Key Achievements</Label>
                <Textarea
                  id="achievements"
                  value={formData.achievements}
                  onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))}
                  placeholder="Major accomplishments and achievements in this role"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    id="currentJob"
                    checked={formData.currentJob}
                    onCheckedChange={(checked) => {
                      setFormData(prev => ({
                        ...prev,
                        currentJob: checked,
                        endDate: checked ? '' : prev.endDate
                      }));
                    }}
                  />
                  <Label htmlFor="currentJob">Current Job</Label>
                </div>
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
                  {editingExperience ? 'Update' : 'Create'} Experience
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {sortedExperiences.map((experience) => (
          <Card key={experience.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {experience.companyLogo && (
                    <img
                      src={experience.companyLogo}
                      alt={experience.company}
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{experience.position}</CardTitle>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Building className="w-4 h-4" />
                      <span className="font-medium">{experience.company}</span>
                      {experience.location && <span>• {experience.location}</span>}
                      {experience.currentJob && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Current</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDateRange(experience.startDate, experience.endDate, experience.currentJob)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(experience)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(experience.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm">{experience.description}</p>

                {experience.responsibilities && Array.isArray(experience.responsibilities) && experience.responsibilities.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Key Responsibilities:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {experience.responsibilities.map((responsibility, index) => (
                        <li key={index} className="text-sm">{responsibility}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {experience.achievements && (
                  <div>
                    <h4 className="font-medium mb-2">Key Achievements:</h4>
                    <p className="text-sm">{experience.achievements}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedExperiences.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No work experience added yet.</p>
        </div>
      )}
    </div>
  );
}