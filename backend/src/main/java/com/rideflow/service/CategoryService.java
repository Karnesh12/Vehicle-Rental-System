package com.rideflow.service;

import com.rideflow.dto.CategoryDto;
import com.rideflow.entity.User;
import com.rideflow.entity.VehicleCategory;
import com.rideflow.exception.ConflictException;
import com.rideflow.exception.ResourceNotFoundException;
import com.rideflow.repository.VehicleCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final VehicleCategoryRepository categoryRepository;
    private final AuditLogService auditLogService;

    public CategoryService(VehicleCategoryRepository categoryRepository, AuditLogService auditLogService) {
        this.categoryRepository = categoryRepository;
        this.auditLogService = auditLogService;
    }

    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> new CategoryDto(c.getId(), c.getName(), c.getDescription(), c.getBaseDeposit()))
                .collect(Collectors.toList());
    }

    public VehicleCategory getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
    }

    @Transactional
    public CategoryDto createCategory(CategoryDto dto, User user) {
        if (categoryRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new ConflictException("Category already exists: " + dto.getName());
        }

        VehicleCategory category = new VehicleCategory(dto.getName(), dto.getDescription(), dto.getBaseDeposit());
        category = categoryRepository.save(category);

        auditLogService.log(user, "CREATE_CATEGORY", "VehicleCategory", category.getId().toString(), null, category.getName(), null);

        return new CategoryDto(category.getId(), category.getName(), category.getDescription(), category.getBaseDeposit());
    }

    @Transactional
    public CategoryDto updateCategory(Long id, CategoryDto dto, User user) {
        VehicleCategory category = getCategoryById(id);
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setBaseDeposit(dto.getBaseDeposit());
        category = categoryRepository.save(category);

        auditLogService.log(user, "UPDATE_CATEGORY", "VehicleCategory", id.toString(), null, category.getName(), null);

        return new CategoryDto(category.getId(), category.getName(), category.getDescription(), category.getBaseDeposit());
    }

    @Transactional
    public void deleteCategory(Long id, User user) {
        VehicleCategory category = getCategoryById(id);
        categoryRepository.delete(category);
        auditLogService.log(user, "DELETE_CATEGORY", "VehicleCategory", id.toString(), category.getName(), null, null);
    }
}
