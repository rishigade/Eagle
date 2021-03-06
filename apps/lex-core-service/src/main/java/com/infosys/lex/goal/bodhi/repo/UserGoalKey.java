/*               "Copyright 2020 Infosys Ltd.
               Use of this source code is governed by GPL v3 license that can be found in the LICENSE file or at https://opensource.org/licenses/GPL-3.0
               This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License version 3" */
/**
© 2017 - 2019 Infosys Limited, Bangalore, India. All Rights Reserved. 
Version: 1.10

Except for any free or open source software components embedded in this Infosys proprietary software program (“Program”),
this Program is protected by copyright laws, international treaties and other pending or existing intellectual property rights in India,
the United States and other countries. Except as expressly permitted, any unauthorized reproduction, storage, transmission in any form or
by any means (including without limitation electronic, mechanical, printing, photocopying, recording or otherwise), or any distribution of 
this Program, or any portion of it, may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible
under the law.

Highly Confidential
 
*/
substitute url based on requirement

import java.io.Serializable;
import java.util.UUID;

import org.apache.commons.lang3.builder.HashCodeBuilder;
import org.springframework.data.cassandra.core.cql.Ordering;
import org.springframework.data.cassandra.core.cql.PrimaryKeyType;
import org.springframework.data.cassandra.core.mapping.PrimaryKeyClass;
import org.springframework.data.cassandra.core.mapping.PrimaryKeyColumn;

@PrimaryKeyClass
public class UserGoalKey implements Serializable {

	private static final long serialVersionUID = 1L;
//	@PrimaryKeyColumn(name = "user_id", ordinal = 0, type = PrimaryKeyType.PARTITIONED)
//	private String uuid;
	@PrimaryKeyColumn(name = "root_org", ordinal = 0, type = PrimaryKeyType.PARTITIONED)
	private String rootOrg;
	@PrimaryKeyColumn(name = "user_id", ordinal = 1, type = PrimaryKeyType.PARTITIONED)
	private String uuid;
	@PrimaryKeyColumn(name = "goal_type", ordinal = 2, type = PrimaryKeyType.PARTITIONED)
	private String goalType;
	@PrimaryKeyColumn(name = "goal_id", ordinal = 3, type = PrimaryKeyType.CLUSTERED, ordering = Ordering.ASCENDING)
	private UUID goalId;

	public UserGoalKey() {
	}

	public UserGoalKey(String rootOrg, String uuid, String goalType, UUID goalId) {
		super();
		this.rootOrg = rootOrg;
		this.uuid = uuid;
		this.goalType = goalType;
		this.goalId = goalId;
	}

	public String getRootOrg() {
		return rootOrg;
	}

	public void setRootOrg(String rootOrg) {
		this.rootOrg = rootOrg;
	}

	public String getUUID() {
		return uuid;
	}

	public void setUUID(String uuid) {
		this.uuid = uuid;
	}

	public String getGoalType() {
		return goalType;
	}

	public void setGoalType(String goalType) {
		this.goalType = goalType;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

	public UUID getGoalId() {
		return goalId;
	}

	public void setGoalId(UUID goalId) {
		this.goalId = goalId;
	}

	@Override
	public boolean equals(Object o) {
		UserGoalKey keyCompared = (UserGoalKey) o;
		if (this.goalId.equals(keyCompared.getGoalId()) && this.getRootOrg().equals(keyCompared.getRootOrg())
				&& this.getUUID().equals(keyCompared.getUUID()) && this.goalType.equals(keyCompared.getGoalType())) {
			return true;
		}
		return false;
	}

	@Override
	public int hashCode() {
		return new HashCodeBuilder(17, 37).append(uuid).append(rootOrg).append(goalType).append(goalId).toHashCode();
	}

}
